import { z } from "zod";

export const TripJournalEntrySchema = z.object({

  sections: z.array(
    z.object({
      title: z.string().max(60),
      description: z.string().max(120),
    })
  ).min(1).max(10),
});