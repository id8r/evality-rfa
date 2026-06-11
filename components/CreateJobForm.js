/*
components/CreateJobForm.js | Create job form | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { useState } from "react";
import { CONTENT_WIDTH_NARROW_CLASS } from "@/lib/FxConstants";

export function CreateJobForm() {
  const [jobDescription, setJobDescription] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (jobDescription.trim()) {
      // TODO: Submit to backend/save to state
      console.log("Job description:", jobDescription);
    }
  }

  return (
    <div className={`mx-auto mt-[32px] w-full ${CONTENT_WIDTH_NARROW_CLASS}`}>
      <form onSubmit={handleSubmit} className="space-y-[24px]">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">What are you hiring for?</h1>
        </div>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="I need 5 React developers for a Bengaluru product team."
          className="w-full min-h-[120px] rounded-[10px] border border-border bg-background px-[16px] py-[12px] text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring resize-none"
        />

        <p className="text-sm text-muted-foreground">
          Describe the role in one sentence. Evality will help structure it.
        </p>

        <button
          type="submit"
          disabled={!jobDescription.trim()}
          className="h-[48px] rounded-[10px] bg-foreground px-[24px] text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Create Job
        </button>
      </form>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
