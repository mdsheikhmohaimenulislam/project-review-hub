
export async function isValidGitHubRepo(
  url: string,
): Promise<boolean> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return false;
  }

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== "github.com" ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.port
  ) {
    return false;
  }

  const parts = parsedUrl.pathname.split("/").filter(Boolean);

  if (parts.length !== 2) {
    return false;
  }

  const [owner, repo] = parts;

  if (
    !owner ||
    !repo ||
    !/^[a-zA-Z0-9-]+$/.test(owner) ||
    !/^[a-zA-Z0-9_.-]+$/.test(repo)
  ) {
    return false;
  }

  const cleanRepo = repo.replace(/\.git$/, "");

  let response: Response;

  try {
    response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(cleanRepo)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch {
    throw new Error(
      "Could not connect to GitHub. Please try again.",
    );
  }

  if (response.status === 200) {
    return true;
  }

  if (response.status === 404) {
    return false;
  }

  throw new Error(
    "GitHub repository validation is temporarily unavailable.",
  );
}
