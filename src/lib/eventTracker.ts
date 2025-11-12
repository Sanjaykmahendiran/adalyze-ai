// lib/eventTracker.ts
import { getSessionId } from "./sessionManager";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";

interface EventPayload {
    gofor: "addevents";
    user_id: string | null;
    event_name: string;
    page_url: string;
    session_id: string;
    email_temp: string | null;
    cookie_id: string | null;
    currency: string | null;
    event_value: number | null;
    metadata?: {
        utm_source?: string;
        utm_campaign?: string;
        ad_id?: string;
    };
}

const EVENT_API_URL = "https://adalyzeai.xyz/App/tapi.php";
const EVENT_QUEUE_KEY = "adalyze_event_queue_v1"; // versionable

// == Utility function to extract metadata from URL ==
function extractMetadataFromUrl(): { utm_source?: string; utm_campaign?: string; ad_id?: string } {
    if (typeof window === "undefined") return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    const metadata: { utm_source?: string; utm_campaign?: string; ad_id?: string } = {};
    
    // Extract UTM parameters
    const utmSource = urlParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign');
    const adId = urlParams.get('ad_id');
    
    if (utmSource) metadata.utm_source = utmSource;
    if (utmCampaign) metadata.utm_campaign = utmCampaign;
    if (adId) metadata.ad_id = adId;
    
    return metadata;
}

// == LocalQueue helpers ==
function getEventQueue(): EventPayload[] {
    try {
        const data = localStorage.getItem(EVENT_QUEUE_KEY);
        return data ? (JSON.parse(data) as EventPayload[]) : [];
    } catch {
        return [];
    }
}

function saveEventQueue(queue: EventPayload[]) {
    try {
        localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(queue));
    } catch {
        // ignore
    }
}

// == send single event (non-debounced underlying sender) ==
async function sendEventNow(payload: EventPayload) {
    try {
        const res = await fetch(EVENT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        // success -> nothing more
    } catch (err) {
        // push to local queue if any failure (network/offline/server)
        const q = getEventQueue();
        q.push(payload);
        saveEventQueue(q);
        // don't throw
    }
}

// == Debounced sender (prevents flooding in rapid succession) ==
const debouncedSend = debounce((payload: EventPayload) => {
    // direct send (this will queue on failure inside sendEventNow)
    void sendEventNow(payload);
}, 1000); // 1 second debounce (adjustable)

// == process queued events ==
async function processQueuedEvents() {
    const queue = getEventQueue();
    if (!queue.length) return;

    const remaining: EventPayload[] = [];

    for (const ev of queue) {
        try {
            const res = await fetch(EVENT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ev),
            });
            if (!res.ok) {
                remaining.push(ev);
            }
        } catch {
            remaining.push(ev);
        }
    }

    saveEventQueue(remaining);
}

// Retry queued events when we become online
if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
        void processQueuedEvents();
    });

    // also attempt to flush queued events on load
    void processQueuedEvents();
}

/**
 * Public: trackEvent(eventName, pageUrl, email?)
 * - eventName : e.g. "Page_View", "Register_1st", "Register_completed"
 * - pageUrl : full URL or path string
 * - email : optional
 */
export function trackEvent(eventName: string, pageUrl: string, email?: string | null, currency?: string | null, eventValue?: number | null  ) {
    if (typeof window === "undefined") return;

    const metadata = extractMetadataFromUrl();
    
    const payload: EventPayload = {
        gofor: "addevents",
        user_id: Cookies.get("userId") || null,
        event_name: eventName,
        page_url: pageUrl,
        session_id: getSessionId(),
        email_temp: email ?? null,
        cookie_id: Cookies.get("cookie_id") || null,
        currency: currency ?? null,
        event_value: eventValue ?? null,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    // Use debounced sender (safe: sendEventNow also queues on failure)
    debouncedSend(payload);
}
