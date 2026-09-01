import { Router } from "express";
import Event from "../models/Event.model";
import { requireAuth } from "../lib/middleware/requireAuth";
import { requireAdmin } from "../lib/middleware/requireAdmin";

const router = Router();

// Public: Get published events
router.get("/", async (req, res) => {
  try {
    const { tag, limit = 12, page = 1 } = req.query;
    
    const query: any = { status: "published" };
    if (tag) query.tags = tag;

    const skip = (Number(page) - 1) * Number(limit);

    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit));
      
    const total = await Event.countDocuments(query);

    // Cache control for ISR pattern on public event list
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.json({
      events,
      pagination: { page: Number(page), limit: Number(limit), total }
    });
  } catch (error) {
    console.error("Error fetching events", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Public: Get single event by slug
router.get("/:slug", async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, status: "published" });
    if (!event) return res.status(404).json({ error: "Event not found" });
    
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Create Event
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user?.userId
    });
    res.status(201).json({ event });
  } catch (error) {
    console.error("Error creating event", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Update Event
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
