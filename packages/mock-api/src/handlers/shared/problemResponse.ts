import { HttpResponse } from "msw";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export interface ProblemInput {
  status: number;
  title: string;
  detail: string;
  typeSlug?: string;
}

export function problemDetailsFrom(input: ProblemInput): ProblemDetails {
  const slug = input.typeSlug ?? input.title.toLowerCase().replaceAll(" ", "-");
  return {
    type: `https://pulseboard.dev/problems/${slug}`,
    title: input.title,
    status: input.status,
    detail: input.detail,
  };
}

export function problemResponse(input: ProblemInput) {
  return new HttpResponse(JSON.stringify(problemDetailsFrom(input)), {
    status: input.status,
    headers: { "Content-Type": "application/problem+json" },
  });
}
