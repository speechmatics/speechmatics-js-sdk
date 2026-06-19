import test from "node:test";
import { getFullURL } from "../src/request";
import assert from "node:assert";

test("getFullURL", async (t) => {
  const defaultURL = getFullURL("/v2/jobs", "https://asr.api.speechmatics.com");
  assert(
    defaultURL ===
      "https://asr.api.speechmatics.com/v2/jobs?sm-sdk=js-0.0.0-test"
  );

  const withParams = getFullURL("/v2/jobs", "https://asr.api.speechmatics.com", {
    "some-param": "test"
  });
  assert(
    withParams ===
      "https://asr.api.speechmatics.com/v2/jobs?sm-sdk=js-0.0.0-test&some-param=test"
  );

  const customSubpathURL = getFullURL(
    "/v2/jobs",
    "https://gateway.com/speechmatics"
  );
  assert(
    customSubpathURL ===
      "https://gateway.com/speechmatics/v2/jobs?sm-sdk=js-0.0.0-test"
  );
});
