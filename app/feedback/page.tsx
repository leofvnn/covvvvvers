import type { Metadata } from "next";
import FeedbackForm from "./FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Tell us what you think of Covvvvvers, report a problem or suggest a correction.",
};

export default function FeedbackPage() {
  return (
    <section className="panel">
      <h1>Feedback</h1>
      <p>
        Spotted a wrong credit, have an idea, or something isn't working? Tell us here. If you know an album that
        belongs in the collection, <a href="/submit">submit a cover</a> instead.
      </p>
      <FeedbackForm />
    </section>
  );
}
