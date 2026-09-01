import { Router } from "express";
import User from "../models/User.model";
import { requireAuth } from "../lib/middleware/requireAuth";
import { requireAdmin } from "../lib/middleware/requireAdmin";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", async (req, res) => {
  try {
    const { branch, year, event, limit = 20, page = 1 } = req.query;
    const query: any = {};
    if (branch) query.branch = branch;
    if (year) query.yearOfStudy = year;
    if (event) query.registeredEvents = event;

    const skip = (Number(page) - 1) * Number(limit);

    const members = await User.find(query)
      .select("-passwordHash")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
      
    const total = await User.countDocuments(query);
    
    res.json({ members, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    console.error("Error fetching members", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/export", async (req, res) => {
  try {
    const { branch, year, event } = req.query;
    const query: any = {};
    if (branch) query.branch = branch;
    if (year) query.yearOfStudy = year;
    if (event) query.registeredEvents = event;

    const members = await User.find(query).select("name email studentId branch yearOfStudy membershipStatus createdAt").lean();
    
    // Very basic CSV generation without a heavy library for MVP
    if (members.length === 0) {
      return res.status(404).send("No data to export");
    }

    const headers = ["Name", "Email", "Student ID", "Branch", "Year", "Status", "Joined"];
    const csvRows = [headers.join(",")];

    for (const m of members) {
      csvRows.push([
        `"${m.name}"`,
        `"${m.email}"`,
        `"${m.studentId}"`,
        `"${m.branch}"`,
        m.yearOfStudy,
        `"${m.membershipStatus}"`,
        `"${m.createdAt.toISOString()}"`
      ].join(","));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="members-export.csv"');
    res.send(csvRows.join("\n"));
  } catch (error) {
    console.error("Error exporting members", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
