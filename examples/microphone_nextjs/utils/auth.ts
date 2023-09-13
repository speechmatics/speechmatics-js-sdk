import { RealtimeSession } from "speechmatics";

export function getJwt() {
  // Instantiate an RT session to get the default URLs. Should really be available in their own right
  // This is a limitation of the SDK interface and will be fixed at some point
  const rtSession = new RealtimeSession("");

  return fetch(
    `${rtSession.connectionConfig.managementPlatformUrl}/api_keys?type=rt`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_API_KEY}`,
      },
      body: JSON.stringify({ ttl: 3600 }),
    }
  )
    .then((res) => res.json())
    .then((data) => data.key_value);
}