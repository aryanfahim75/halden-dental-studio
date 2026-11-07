import { permanentRedirect } from "next/navigation";

/** /team was the old address of the doctors page. */
export default function TeamPage() {
  permanentRedirect("/doctors");
}
