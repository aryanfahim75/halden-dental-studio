import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="section">
      <div className="container container--narrow">
        <h1 className="h1 h1--small">That page is not here.</h1>
        <p className="lead">
          The link may be old. The booking page and the treatments list are both where they belong.
        </p>
        <div className="hero__actions hero__actions--tight">
          <ButtonLink href="/book" variant="primary">
            Book a visit
          </ButtonLink>
          <Link className="rows-link" href="/">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
