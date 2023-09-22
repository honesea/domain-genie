const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

export async function POST(req: Request) {
  const { domain } = await req.json();

  try {
    const options = {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "domainr.p.rapidapi.com",
      },
    };

    const params = new URLSearchParams({
      "mashape-key": RAPIDAPI_KEY,
      domain,
    });

    const response = await fetch(
      "https://domainr.p.rapidapi.com/v2/status?" + params.toString(),
      options,
    );

    let domainStatus = "";
    try {
      const result = await response.json();
      const statusString = result.status[0].status;
      const statusList = statusString.split(" ");
      domainStatus = statusList.includes("inactive")
        ? "AVAILABLE"
        : "UNAVAILABLE";
    } catch (error) {
      domainStatus = "UNAVAILABLE";
    }

    return Response.json({ domain_status: domainStatus }, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 },
    );
  }
}
