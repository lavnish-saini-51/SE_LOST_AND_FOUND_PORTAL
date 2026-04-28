import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Card className="rounded-2xl text-center">
        <div className="text-3xl font-semibold tracking-tight">404</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">That page does not exist.</div>
        <div className="mt-5 flex justify-center">
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

