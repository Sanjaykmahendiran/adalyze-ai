"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    AlertCircle,
    Plus,
    Check,
    Edit3,
    Globe,
    Link as LinkIcon,
    BarChart3,
    Puzzle,
    Users,
    Zap,
    Circle,
    Eye,
    Target,
    Wallet,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

type StatusAPI = "done" | "not_done";

// Evidence format coming from API (if provided)
type EvidenceFormat = "URL" | "SCREENSHOT" | "MESSAGE BOX";

type APIChecklistItem = {
    checklist_id: number;
    slug: string;
    title: string;
    description: string;
    help_url: string | null;
    is_critical: 0 | 1;
    status: StatusAPI;
    evidence_url: string; // can be URL, image URL, or plain text
    format?: EvidenceFormat; // new optional field from API
};

type LeftInfoBullet = {
    icon: React.ReactNode;
    text: string;
    colorClass?: string;
};

type LeftInfo = {
    title: string;
    intro: string;
    bullets: LeftInfoBullet[];
    tip?: string;
};

type Props = {
    adUploadId: number;
    userId: string;
};

const defaultLeftInfo: LeftInfo = {
    title: "Why Pre-Campaign Checklist Matters",
    intro:
        "Every successful campaign starts with a solid foundation. The Adalyze Pre-Campaign Checklist ensures that you’ve covered all technical and strategic aspects before launching ads — reducing wasted spend and improving ad performance.",
    bullets: [
        { icon: <Globe className="w-5 h-5" />, text: "Validate landing pages, audiences, and tracking accuracy.", colorClass: "text-green-500" },
        { icon: <BarChart3 className="w-5 h-5" />, text: "Prevent budget loss from missing setup or tracking issues.", colorClass: "text-yellow-500" },
        { icon: <Zap className="w-5 h-5" />, text: "Launch confidently knowing your data is accurate.", colorClass: "text-blue-500" },
    ],
    tip: "💬 Tip: Completing this checklist improves conversion tracking and data reliability by over 70% across campaigns.",
};

function statusIcon(status: StatusAPI) {
    if (status === "done") return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    return <AlertCircle className="w-6 h-6 text-yellow-500" />;
}

function itemIconBySlug(slug: string) {
    const s = slug.toLowerCase();

    if (s.includes("lp") || s.includes("landing"))
        return <Globe className="w-6 h-6 text-blue-400" />;

    if (s.includes("utm") || s.includes("link"))
        return <LinkIcon className="w-6 h-6 text-green-400" />;

    if (s.includes("pixel") || s.includes("gtm") || s.includes("tracking"))
        return <BarChart3 className="w-6 h-6 text-purple-400" />;

    if (s.includes("conversion"))
        return <Target className="w-6 h-6 text-red-400" />;

    if (s.includes("audience") || s.includes("geo") || s.includes("demographic"))
        return <Users className="w-6 h-6 text-yellow-400" />;

    if (s.includes("budget") || s.includes("plan"))
        return <Wallet className="w-6 h-6 text-orange-400" />;

    return <Circle className="w-6 h-6 text-gray-400" />;
}

export default function PreCampaignChecklist({
    adUploadId,
    userId,
}: Props) {
    const [items, setItems] = useState<APIChecklistItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [err, setErr] = useState<string | null>(null);

    // Add Task modal state (disabled/commented for now)
    // const [showAddTask, setShowAddTask] = useState(false);
    // const [addTaskChecklistId, setAddTaskChecklistId] = useState<number | null>(null);
    // const [addTaskForm, setAddTaskForm] = useState({
    //   title: "",
    //   description: "",
    //   priority: "high",
    //   status: "open",
    //   due_date: "",
    // });

    // Mark Done modal state
    const [showMarkDone, setShowMarkDone] = useState(false);
    const [markDoneItem, setMarkDoneItem] = useState<APIChecklistItem | null>(null);
    const [evidenceUrl, setEvidenceUrl] = useState("");

    // Screenshot upload state (for SCREENSHOT format)
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Evidence Viewer state
    const [showViewer, setShowViewer] = useState(false);
    const [viewerItem, setViewerItem] = useState<APIChecklistItem | null>(null);

    const total = items.length;
    const completed = useMemo(() => items.filter((i) => i.status === "done").length, [items]);
    const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

    const fetchChecklist = async () => {
        try {
            setLoading(true);
            setErr(null);
            const url = `https://adalyzeai.xyz/App/api.php?gofor=prechecklistlist&ad_upload_id=${adUploadId}`;
            const res = await fetch(url, { method: "GET", cache: "no-store" });
            const data = await res.json();
            if (data?.status && Array.isArray(data?.data)) {
                setItems(data.data as APIChecklistItem[]);
            } else {
                setItems([]);
            }
        } catch (e: any) {
            setErr(e?.message || "Failed to load checklist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChecklist();
    }, [adUploadId]);

    // Disabled Add Task flow
    // const openAddTask = (checklist_id: number) => {
    //   setAddTaskChecklistId(checklist_id);
    //   setAddTaskForm({
    //     title: "",
    //     description: "",
    //     priority: "high",
    //     status: "open",
    //     due_date: "",
    //   });
    //   setShowAddTask(true);
    // };

    // const submitAddTask = async () => {
    //   if (!addTaskChecklistId) return;
    //
    //   const payload = {
    //     gofor: "addadtask",
    //     ad_upload_id: String(adUploadId),
    //     checklist_id: String(addTaskChecklistId),
    //     title: addTaskForm.title,
    //     description: addTaskForm.description,
    //     priority: addTaskForm.priority,
    //     status: addTaskForm.status,
    //     due_date: addTaskForm.due_date,
    //     created_by: userId,
    //   };
    //
    //   try {
    //     const res = await fetch("https://adalyzeai.xyz/App/api.php", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(payload),
    //     });
    //     const data = await res.json();
    //     if (data.response === "Task Created successfully") {
    //       toast.success("Task created successfully!");
    //       setShowAddTask(false);
    //       await fetchChecklist();
    //     } else {
    //       toast.error(data.response || "Failed to create task.");
    //     }
    //   } catch (error) {
    //     console.error(error);
    //     toast.error("Failed to create task.");
    //   }
    // };

    const openMarkDone = (item: APIChecklistItem) => {
        setMarkDoneItem(item);
        setEvidenceUrl(item.evidence_url || "");
        setScreenshotFile(null);
        setShowMarkDone(true);
    };

    // infer evidence kind for viewer
    const getEvidenceKind = (value: string, format?: EvidenceFormat): "image" | "url" | "text" => {
        if (format === "SCREENSHOT") return "image";
        if (format === "URL") return "url";
        if (format === "MESSAGE BOX") return "text";
        const v = (value || "").trim();
        if (!v) return "text";
        const lower = v.toLowerCase();
        const isImageExt = /\.(png|jpe?g|gif|webp|svg)$/i.test(lower);
        const isDataImg = lower.startsWith("data:image/");
        if (isImageExt || isDataImg) return "image";
        if (lower.startsWith("http://") || lower.startsWith("https://")) return "url";
        return "text";
    };

    const openViewer = (item: APIChecklistItem) => {
        setViewerItem(item);
        setShowViewer(true);
    };

    const closeViewer = () => {
        setViewerItem(null);
        setShowViewer(false);
    };

    const uploadScreenshotAndGetUrl = async (file: File): Promise<string> => {
        // Read file as data URL, then strip the prefix to get raw base64
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const result = reader.result as string;
                    const raw = result.includes(",") ? result.split(",")[1] : result;
                    resolve(raw);
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const payload = {
            gofor: "image_upload",
            imgname: base64, // raw base64 (no data: prefix)
            type: "checklist-evidence",
        };

        const res = await fetch("https://adalyzeai.xyz/App/api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        // Try common fields that could contain the URL
        const url = data?.url || data?.image_url || data?.data?.url || data?.result?.url || "";
        if (!url) {
            throw new Error("Image upload did not return a URL");
        }
        return url as string;
    };

    const submitMarkDone = async () => {
        if (!markDoneItem) return;

        try {
            let finalEvidence = evidenceUrl?.trim() ?? "";

            // If format is SCREENSHOT and user selected a file, upload then use returned URL
            const effFormat = markDoneItem.format;
            if (effFormat === "SCREENSHOT") {
                if (screenshotFile) {
                    setUploadingImage(true);
                    try {
                        const uploadedUrl = await uploadScreenshotAndGetUrl(screenshotFile);
                        finalEvidence = uploadedUrl;
                    } finally {
                        setUploadingImage(false);
                    }
                } else if (!finalEvidence) {
                    toast.error("Please upload a screenshot before submitting.");
                    return;
                }
            }

            const payload = {
                gofor: "markchecklistdone",
                ad_upload_id: String(adUploadId),
                checklist_id: String(markDoneItem.checklist_id),
                status: "done",
                updated_by: userId,
                evidence_url: finalEvidence,
            };

            const res = await fetch("https://adalyzeai.xyz/App/api.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            // Keep existing success check, but allow a fallback success condition
            if ((data.status && data.message === "Checklist Created successfully.") || data.status === true || data.success === true) {
                toast.success("Checklist updated successfully!");
            } else {
                toast.error(data.message || "Something went wrong.");
            }

            setShowMarkDone(false);
            setMarkDoneItem(null);
            await fetchChecklist();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Failed to submit request.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 ">
            {/* Left Info Section */}
            <section className="md:col-span-1 bg-black rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-primary/20 p-3 rounded-xl">
                            <Zap className="w-7 h-7 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold text-primary">{defaultLeftInfo.title}</h2>
                    </div>

                    <p className="text-white/80 text-sm leading-relaxed mb-6">{defaultLeftInfo.intro}</p>

                    <ul className="space-y-4 text-sm text-white/70">
                        {defaultLeftInfo.bullets.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">{b.icon}</span>
                                <span>{b.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {defaultLeftInfo.tip ? (
                    <div className="mt-4 border-t border-white/80 pt-6 text-white/60 text-xs">
                        <p>{defaultLeftInfo.tip}</p>
                    </div>
                ) : null}
            </section>

            {/* Right Checklist Section */}
            <section className="md:col-span-2 bg-black rounded-3xl p-4 sm:p-6 shadow-2xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                            Your Campaign Readiness
                        </h1>
                        <p className="text-white/70 text-sm mt-1">
                            Complete these key steps before launching to ensure accurate performance tracking.
                        </p>
                    </div>
                </div>

                {/* Loading / Error */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between bg-[#171717] p-3 sm:p-4 rounded-lg"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 bg-[#2b2b2b] rounded-md" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-[#2b2b2b] rounded w-3/4" />
                                        <div className="h-2 bg-[#2b2b2b] rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="w-6 h-6 bg-[#2b2b2b] rounded" />
                            </div>
                        ))}
                    </div>
                ) : err ? (
                    <div className="text-sm text-red-400">Error: {err}</div>
                ) : (
                    <>
                        {/* Checklist Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {items.map((item) => {
                                const isDone = item.status === "done";
                                return (
                                    <div
                                        key={item.checklist_id}
                                        className="flex items-center justify-between bg-[#171717] p-3 sm:p-4 rounded-lg border border-transparent hover:border-primary/40 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl text-primary">{itemIconBySlug(item.slug)}</span>
                                            <div>
                                                <p className="font-medium text-white flex items-center gap-2">
                                                    {item.title}
                                                    {item.is_critical ? (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                                                            critical
                                                        </span>
                                                    ) : null}
                                                </p>
                                                <p className="text-xs text-white/70">{item.description}</p>
                                            </div>
                                        </div>

                                        {/* Right side actions */}
                                        <div className="flex items-center gap-2">
                                            {isDone ? (
                                                <div className="flex flex-col gap-2">
                                                    {/* View evidence (Eye) */}
                                                    <button
                                                        className="bg-blue-600/20 text-blue-300 hover:text-white p-1 rounded-lg flex items-center justify-center"
                                                        aria-label="View evidence"
                                                        title="View evidence"
                                                        onClick={() => openViewer(item)}
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {/* Add Task removed/commented */}
                                                    {/* <button
                                                        className="bg-primary/20 text-primary hover:text-primary/80 p-1 rounded-lg flex items-center justify-center"
                                                        aria-label="Add task"
                                                        title="Add task"
                                                        onClick={() => openAddTask(item.checklist_id)}
                                                        >
                                                        <Plus className="w-5 h-5" />
                                                        </button> */}

                                                    {/* Mark Done */}
                                                    <button
                                                        className="bg-green-600/20 text-green-300 hover:text-white p-1 rounded-lg flex items-center justify-center"
                                                        aria-label="Mark done"
                                                        title="Mark done"
                                                        onClick={() => openMarkDone(item)}
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Progress Bar - Prominent bottom alignment */}
                        <div className="mt-8 border-t border-[#2b2b2b] pt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <span className="text-sm text-white/70 font-medium">Overall Progress</span>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="flex-1 sm:w-60 bg-[#1f1f1f] h-3 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-primary whitespace-nowrap">
                                        {completed}/{total}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>


            {/* Evidence Viewer Modal */}
            {showViewer && viewerItem ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-xl p-5 relative">
                        <h3 className="text-white font-semibold text-lg mb-4">Evidence</h3>

                        {(() => {
                            const kind = getEvidenceKind(viewerItem.evidence_url, viewerItem.format);
                            const val = (viewerItem.evidence_url || "").trim();

                            if (!val) {
                                return <p className="text-sm text-white/80">No evidence submitted.</p>;
                            }

                            if (kind === "image") {
                                return (
                                    <div className="w-full">
                                        <img
                                            src={val}
                                            alt="Evidence"
                                            className="max-h-[60vh] w-auto rounded-md object-contain border border-white/10"
                                        />
                                    </div>
                                );
                            }

                            if (kind === "url") {
                                return (
                                    <a
                                        href={val}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary underline break-all"
                                    >
                                        {val}
                                    </a>
                                );
                            }

                            return (
                                <pre className="whitespace-pre-wrap text-sm text-gray-200 bg-black/40 rounded-md p-3 border border-white/10">
                                    {val}
                                </pre>
                            );
                        })()}

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <Button variant="outline" onClick={closeViewer}>
                                Close
                            </Button>

                            {/* Edit at bottom-right inside the viewer */}
                            <Button
                                onClick={() => {
                                    closeViewer();
                                    openMarkDone(viewerItem);
                                }}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Mark Done Modal (format-specific fields) */}
            {showMarkDone && markDoneItem ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-xl p-5">
                        <h3 className="text-white font-semibold text-lg mb-4">Mark Checklist as Done</h3>

                        <div className="grid gap-3">
                            {(() => {
                                const f = markDoneItem.format;

                                if (f === "URL") {
                                    return (
                                        <div>
                                            <Label className="block text-base text-white mb-1">Evidence URL</Label>
                                            <Input
                                                className="w-full rounded-md bg-black px-3 py-2 text-sm text-white"
                                                value={evidenceUrl}
                                                onChange={(e) => setEvidenceUrl(e.target.value)}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    );
                                }

                                if (f === "SCREENSHOT") {
                                    return (
                                        <div className="grid gap-2 items-center">
                                            <Label className="block text-base text-white mb-1">Upload Screenshot</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="w-full rounded-md bg-black px-3 text-sm text-white items-center "
                                                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                                            />
                                            {screenshotFile ? (
                                                <p className="text-xs text-gray-400">Selected: {screenshotFile.name}</p>
                                            ) : evidenceUrl ? (
                                                <p className="text-xs text-gray-400 break-all">Current: {evidenceUrl}</p>
                                            ) : null}
                                        </div>
                                    );
                                }

                                if (f === "MESSAGE BOX") {
                                    return (
                                        <div>
                                            <Label className="block text-base text-white mb-1">Message</Label>
                                            <Textarea
                                                className="w-full rounded-md bg-black px-3 py-2 text-sm text-white"
                                                rows={4}
                                                value={evidenceUrl}
                                                onChange={(e) => setEvidenceUrl(e.target.value)}
                                                placeholder="Enter details..."
                                            />
                                        </div>
                                    );
                                }

                                // Fallback: try to infer by current evidence
                                const kind = getEvidenceKind(evidenceUrl, undefined);
                                if (kind === "url") {
                                    return (
                                        <div>
                                            <Label className="block text-base text-white mb-1">Evidence URL</Label>
                                            <Input
                                                className="w-full rounded-md bg-black px-3 py-2 text-sm text-white"
                                                value={evidenceUrl}
                                                onChange={(e) => setEvidenceUrl(e.target.value)}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    );
                                }
                                if (kind === "image") {
                                    return (
                                        <div className="grid gap-2">
                                            <Label className="block text-base text-white mb-1">Upload Screenshot</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="w-full rounded-md bg-black px-3 py-2 text-sm text-white"
                                                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                                            />
                                            {screenshotFile ? (
                                                <p className="text-xs text-gray-400">Selected: {screenshotFile.name}</p>
                                            ) : evidenceUrl ? (
                                                <p className="text-xs text-gray-400 break-all">Current: {evidenceUrl}</p>
                                            ) : null}
                                        </div>
                                    );
                                }
                                return (
                                    <div>
                                        <Label className="block text-base text-white mb-1">Message</Label>
                                        <Textarea
                                            className="w-full rounded-md bg-black px-3 py-2 text-sm text-white"
                                            rows={4}
                                            value={evidenceUrl}
                                            onChange={(e) => setEvidenceUrl(e.target.value)}
                                            placeholder="Enter details..."
                                        />
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <Button variant="ghost" onClick={() => { setShowMarkDone(false); setMarkDoneItem(null); }}>
                                Cancel
                            </Button>
                            <Button onClick={submitMarkDone} disabled={uploadingImage}>
                                {uploadingImage ? "Uploading..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Add Task Modal */}
            {/* {showAddTask ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="w-full max-w-lg bg-[#171717] rounded-xl p-5">
                        <h3 className="text-white font-semibold text-lg mb-4">Add Task</h3>
                        <div className="grid gap-3">
                            <div>
                                <Label className="block text-base text-white mb-1">Title</Label>
                                <Input
                                    className="w-full rounded-md bg-black px-3 py-2 text-sm text-white"
                                    value={addTaskForm.title}
                                    onChange={(e) => setAddTaskForm((s) => ({ ...s, title: e.target.value }))}
                                    placeholder="Enter Title"
                                />
                            </div>
                            <div>
                                <Label className="block text-base text-white mb-1">Description</Label>
                                <Textarea
                                    className="w-full rounded-md bg-black px-3 py-2 text-sm text-white"
                                    value={addTaskForm.description}
                                    onChange={(e) => setAddTaskForm((s) => ({ ...s, description: e.target.value }))}
                                    rows={3}
                                    placeholder="Enter Description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="block text-base text-white mb-1">Priority</Label>

                                    <Select
                                        value={addTaskForm.priority}
                                        onValueChange={(value) =>
                                            setAddTaskForm((s) => ({ ...s, priority: value }))
                                        }
                                    >
                                        <SelectTrigger className="w-full bg-black text-white">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black text-white border border-white/10">
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="block text-base text-white mb-1">Due date</Label>
                                    <Input
                                        type="date"
                                        className="w-full rounded-md bg-black px-3 py-2 text-sm text-white"
                                        value={addTaskForm.due_date}
                                        onChange={(e) => setAddTaskForm((s) => ({ ...s, due_date: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <Button variant="ghost" onClick={() => setShowAddTask(false)}>
                                Cancel
                            </Button>
                            <Button onClick={submitAddTask}>Create Task</Button>
                        </div>
                    </div>
                </div>
            ) : null} */}
        </div>
    );
}