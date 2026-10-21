const express = require("express");
const Habit = require("../models/Habit");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

function verifyToken(req, res, next) {

    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.json({ message: "No token" });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    next();
}

function toDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return [date.getFullYear(), date.getMonth(), date.getDate()];
}

function compareDateKeys(left, right) {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

function daysBetween(later, earlier) {
  return (
    Date.UTC(later[0], later[1], later[2]) -
    Date.UTC(earlier[0], earlier[1], earlier[2])
  ) / (1000 * 60 * 60 * 24);
}

function datesFromAccount(dates, accountCreatedAt) {
  const accountStart = toDateKey(accountCreatedAt);

  return dates
    .map(toDateKey)
    .filter((date) => date && (!accountStart || compareDateKeys(date, accountStart) >= 0))
    .sort((left, right) => compareDateKeys(left, right));
}

function calculateStreak(dates, accountCreatedAt) {
  if (!dates || dates.length === 0) return 0;

  const sortedDates = datesFromAccount(dates, accountCreatedAt).reverse();
  if (sortedDates.length === 0) return 0;

  let streak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = daysBetween(sortedDates[i - 1], sortedDates[i]);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(dates, accountCreatedAt) {
  if (!dates || dates.length === 0) return 0;

  const sortedDates = datesFromAccount(dates, accountCreatedAt);
  if (sortedDates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = daysBetween(sortedDates[i], sortedDates[i - 1]);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

async function getAccountCreatedAt(userId, habits) {
  const user = await User.findById(userId).select("createdAt");
  if (user?.createdAt) return user.createdAt;

  const completionDates = habits.flatMap((habit) => habit.completedDates || []);
  const habitDates = habits.map((habit) => habit.createdAt).filter(Boolean);
  const legacyDates = [...completionDates, ...habitDates]
    .map((date) => new Date(date))
    .filter((date) => !Number.isNaN(date.getTime()));
  const createdAt = legacyDates.length
    ? new Date(Math.min(...legacyDates.map((date) => date.getTime())))
    : new Date();

  await User.updateOne({ _id: userId }, { $set: { createdAt } });
  return createdAt;
}

router.post("/", verifyToken, async (req, res) => {
  try {
    const title = req.body.title.trim();

    const existing = await Habit.findOne({
      userId: req.userId,
      title: { $regex: `^${title}$`, $options: "i" } // case-insensitive
    });

    if (existing) {
      return res.json({ message: "Habit already exists" });
    }

    const habit = new Habit({
      userId: req.userId,
      title
    });

    await habit.save();
    res.json(habit);

  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.get("/", verifyToken, async (req, res) => {

  const habits = await Habit.find({ userId: req.userId });
  const accountCreatedAt = await getAccountCreatedAt(req.userId, habits);

  const updatedHabits = habits.map(habit => {
    const currentStreak = calculateStreak(habit.completedDates, accountCreatedAt);
    const longestStreak = calculateLongestStreak(habit.completedDates, accountCreatedAt);

    return {
      ...habit._doc,
      currentStreak,
      longestStreak,
      totalCompleted: datesFromAccount(habit.completedDates, accountCreatedAt).length,
      accountCreatedAt
    };
  });

  res.json(updatedHabits);
});

router.delete("/:id", verifyToken, async (req, res) => {

    await Habit.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Deleted" });
});

// MARK HABIT COMPLETE
router.put("/complete/:id", verifyToken, async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) return res.json({ message: "Habit not found" });

  const today = new Date().toDateString();

  if (!habit.completedDates.includes(today)) {
    habit.completedDates.push(today);
    await habit.save();
  }

  res.json({ message: "Habit marked as completed", habit });
});

router.get("/analytics", verifyToken, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId });
    const accountCreatedAt = await getAccountCreatedAt(req.userId, habits);

    const totalHabits = habits.length;

    let totalCompletions = 0;
    let totalStreak = 0;
    let maxHabit = null;
    let maxCompleted = 0;

    habits.forEach(habit => {
      const completed = datesFromAccount(habit.completedDates, accountCreatedAt).length;

      totalCompletions += completed;

      const streak = calculateStreak(habit.completedDates, accountCreatedAt);
      totalStreak += streak;

      if (completed > maxCompleted) {
        maxCompleted = completed;
        maxHabit = habit.title;
      }
    });

    const avgStreak =
      totalHabits > 0 ? (totalStreak / totalHabits).toFixed(2) : 0;

    res.json({
      totalHabits,
      totalCompletions,
      averageStreak: avgStreak,
      mostConsistentHabit: maxHabit || "None"
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
