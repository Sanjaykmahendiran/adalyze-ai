// src/services/__tests__/supportService.test.ts

import {
  getFullAdsList,
  getUserHelpList,
  getUserFeedbackList,
  getUserExpertTalkList,
  getPrivacyPolicy,
  getReturnPolicy,
  getTermsAndConditions,
  submitSupportRequest,
  submitFeedback,
  submitExpertCallRequest,
} from "@/services/supportService";

process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";

const makeFetchOk = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);

const makeFetchFail = (status: number) =>
  Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) } as unknown as Response);

const makeFetchOkText = (body: string) =>
  Promise.resolve({ ok: true, text: () => Promise.resolve(body) } as unknown as Response);

const mockAds = [
  { ad_id: 1, ads_name: "Summer Campaign" },
  { ad_id: 2, ads_name: "Winter Launch" },
];

const mockSupportItems = [
  { help_id: 10, email: "a@b.com", user_id: 5, category: "General", description: "Test issue" },
];

const mockFeedbackItems = [
  { fbid: 20, user_id: 5, rating: 8, comments: "Great!", created_date: "2026-04-11" },
];

const mockExpertItems = [
  { exptalk_id: 30, user_id: 5, prefdate: "2026-04-20", preftime: "10:00", comments: "Morning call" },
];

const mockPolicyText = "<p>Privacy Policy content here</p>";

beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// getFullAdsList
// ---------------------------------------------------------------------------

describe("getFullAdsList", () => {
  it("test_getFullAdsList_fetches_correct_url_with_user_id", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      makeFetchOk({ status: true, data: mockAds })
    );
    await getFullAdsList("5");
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php?gofor=fulladsnamelist&user_id=5");
  });

  it("test_getFullAdsList_returns_data_array_when_status_true", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      makeFetchOk({ status: true, data: mockAds })
    );
    const result = await getFullAdsList("5");
    expect(result).toEqual(mockAds);
  });

  it("test_getFullAdsList_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(getFullAdsList("5")).rejects.toThrow("fulladsnamelist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getUserHelpList
// ---------------------------------------------------------------------------

describe("getUserHelpList", () => {
  it("test_getUserHelpList_fetches_correct_url_with_user_id", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      makeFetchOk({ data: mockSupportItems })
    );
    await getUserHelpList("5");
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php?gofor=userhelplist&user_id=5");
  });

  it("test_getUserHelpList_returns_data_array", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      makeFetchOk({ data: mockSupportItems })
    );
    const result = await getUserHelpList("5");
    expect(result).toEqual(mockSupportItems);
  });

  it("test_getUserHelpList_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(getUserHelpList("5")).rejects.toThrow("userhelplist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getUserFeedbackList
// ---------------------------------------------------------------------------

describe("getUserFeedbackList", () => {
  it("test_getUserFeedbackList_fetches_correct_url_with_user_id", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      makeFetchOk({ data: mockFeedbackItems })
    );
    await getUserFeedbackList("5");
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php?gofor=userfeedbacklist&user_id=5");
  });

  it("test_getUserFeedbackList_returns_data_array", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      makeFetchOk({ data: mockFeedbackItems })
    );
    const result = await getUserFeedbackList("5");
    expect(result).toEqual(mockFeedbackItems);
  });

  it("test_getUserFeedbackList_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(getUserFeedbackList("5")).rejects.toThrow("userfeedbacklist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getUserExpertTalkList
// ---------------------------------------------------------------------------

describe("getUserExpertTalkList", () => {
  it("test_getUserExpertTalkList_fetches_correct_url_with_user_id", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      makeFetchOk({ data: mockExpertItems })
    );
    await getUserExpertTalkList("5");
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php?gofor=userexptalkreqlist&user_id=5");
  });

  it("test_getUserExpertTalkList_returns_data_array", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      makeFetchOk({ data: mockExpertItems })
    );
    const result = await getUserExpertTalkList("5");
    expect(result).toEqual(mockExpertItems);
  });

  it("test_getUserExpertTalkList_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(getUserExpertTalkList("5")).rejects.toThrow("userexptalkreqlist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getPrivacyPolicy
// ---------------------------------------------------------------------------

describe("getPrivacyPolicy", () => {
  it("test_getPrivacyPolicy_fetches_correct_url", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOkText(mockPolicyText));
    await getPrivacyPolicy();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php?gofor=privacypolicy");
  });

  it("test_getPrivacyPolicy_returns_text_not_json", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOkText(mockPolicyText));
    const result = await getPrivacyPolicy();
    expect(result).toBe(mockPolicyText);
  });

  it("test_getPrivacyPolicy_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(getPrivacyPolicy()).rejects.toThrow("privacypolicy failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getReturnPolicy
// ---------------------------------------------------------------------------

describe("getReturnPolicy", () => {
  it("test_getReturnPolicy_fetches_correct_url", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOkText(mockPolicyText));
    await getReturnPolicy();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php?gofor=returnpolicy");
  });

  it("test_getReturnPolicy_returns_text_not_json", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOkText(mockPolicyText));
    const result = await getReturnPolicy();
    expect(result).toBe(mockPolicyText);
  });

  it("test_getReturnPolicy_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(getReturnPolicy()).rejects.toThrow("returnpolicy failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getTermsAndConditions
// ---------------------------------------------------------------------------

describe("getTermsAndConditions", () => {
  it("test_getTermsAndConditions_fetches_correct_url", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOkText(mockPolicyText));
    await getTermsAndConditions();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php?gofor=termsandconditions");
  });

  it("test_getTermsAndConditions_returns_text_not_json", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOkText(mockPolicyText));
    const result = await getTermsAndConditions();
    expect(result).toBe(mockPolicyText);
  });

  it("test_getTermsAndConditions_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(getTermsAndConditions()).rejects.toThrow("termsandconditions failed: 500");
  });
});

// ---------------------------------------------------------------------------
// submitSupportRequest
// ---------------------------------------------------------------------------

describe("submitSupportRequest", () => {
  const supportPayload = {
    user_id: "5",
    category: "General",
    description: "Test issue",
    imgname: "screenshot.png",
  };

  it("test_submitSupportRequest_sends_POST_to_api_php", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitSupportRequest(supportPayload);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php");
  });

  it("test_submitSupportRequest_body_includes_gofor_needhelp", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitSupportRequest(supportPayload);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.gofor).toBe("needhelp");
  });

  it("test_submitSupportRequest_body_includes_payload_fields", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitSupportRequest(supportPayload);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.user_id).toBe("5");
    expect(body.category).toBe("General");
    expect(body.description).toBe("Test issue");
    expect(body.imgname).toBe("screenshot.png");
  });

  it("test_submitSupportRequest_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(submitSupportRequest(supportPayload)).rejects.toThrow("needhelp failed: 500");
  });
});

// ---------------------------------------------------------------------------
// submitFeedback
// ---------------------------------------------------------------------------

describe("submitFeedback", () => {
  const feedbackPayload = {
    user_id: "5",
    rating: 8,
    comments: "Great!",
  };

  it("test_submitFeedback_sends_POST_to_api_php", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitFeedback(feedbackPayload);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php");
  });

  it("test_submitFeedback_body_includes_gofor_feedback", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitFeedback(feedbackPayload);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.gofor).toBe("feedback");
  });

  it("test_submitFeedback_body_includes_payload_fields", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitFeedback(feedbackPayload);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.user_id).toBe("5");
    expect(body.rating).toBe(8);
    expect(body.comments).toBe("Great!");
  });

  it("test_submitFeedback_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(submitFeedback(feedbackPayload)).rejects.toThrow("feedback failed: 500");
  });
});

// ---------------------------------------------------------------------------
// submitExpertCallRequest
// ---------------------------------------------------------------------------

describe("submitExpertCallRequest", () => {
  const expertCallPayload = {
    user_id: "5",
    prefdate: "2026-04-20",
    preftime: "10:00",
    comments: "Morning call",
  };

  it("test_submitExpertCallRequest_sends_POST_to_api_php", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitExpertCallRequest(expertCallPayload);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php");
  });

  it("test_submitExpertCallRequest_body_includes_gofor_exptalkrequest", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitExpertCallRequest(expertCallPayload);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.gofor).toBe("exptalkrequest");
  });

  it("test_submitExpertCallRequest_body_includes_payload_fields", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ ok: true } as Response)
    );
    await submitExpertCallRequest(expertCallPayload);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.user_id).toBe("5");
    expect(body.prefdate).toBe("2026-04-20");
    expect(body.preftime).toBe("10:00");
    expect(body.comments).toBe("Morning call");
  });

  it("test_submitExpertCallRequest_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(submitExpertCallRequest(expertCallPayload)).rejects.toThrow(
      "exptalkrequest failed: 500"
    );
  });
});
