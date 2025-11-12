// app/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JSX, useMemo, useState } from 'react';
import { ArrowRightIcon, PlusIcon, TrashIcon, UploadIcon } from 'lucide-react';

type Direction = {
    title: string;
    bullets: string[];
};

type CopyCard = {
    label: string; // Pattern A/B/C
    title: string;
    body: string;
};

function classNames(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(' ');
}

/** Inline editable text with click-to-edit UX. */
function InlineEditable({
    value,
    onChange,
    className,
    multiline = false,
    placeholder = 'Click to edit',
    as: As = 'div',
}: {
    value: string;
    onChange: (v: string) => void;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
    as?: keyof JSX.IntrinsicElements;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const start = () => {
        setDraft(value);
        setEditing(true);
    };
    const commit = () => {
        onChange(draft.trim());
        setEditing(false);
    };
    const cancel = () => {
        setDraft(value);
        setEditing(false);
    };

    if (editing) {
        if (multiline) {
            return (
                <textarea
                    autoFocus
                    className={classNames(
                        'w-full rounded-lg bg-night border border-slateX-800 p-2 text-slateX-100 focus:outline-none focus:ring-2 focus:ring-teal-500',
                        className,
                    )}
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') cancel();
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commit();
                    }}
                    placeholder={placeholder}
                />
            );
        }
        return (
            <input
                autoFocus
                className={classNames(
                    'w-full rounded-lg bg-night border border-slateX-800 px-2 py-1 text-slateX-100 focus:outline-none focus:ring-2 focus:ring-teal-500',
                    className,
                )}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') cancel();
                    if (e.key === 'Enter') commit();
                }}
                placeholder={placeholder}
            />
        );
    }

    return (
        <As
            className={classNames(
                'cursor-text hover:bg-night/30 rounded',
                value ? '' : 'text-slateX-500 italic',
                className,
            )}
            onClick={start}
            title="Click to edit"
        >
            {value || placeholder}
        </As>
    );
}

/** Simple editable list of strings with add/remove. */
function EditableList({
    items,
    onChange,
    itemClassName,
    pill = false,
}: {
    items: string[];
    onChange: (next: string[]) => void;
    itemClassName?: string;
    pill?: boolean;
}) {
    const updateItem = (idx: number, v: string) => {
        const next = [...items];
        next[idx] = v;
        onChange(next);
    };
    const removeItem = (idx: number) => {
        const next = [...items];
        next.splice(idx, 1);
        onChange(next);
    };
    const addItem = () => onChange([...items, 'New item']);

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
                {items.map((it, idx) => (
                    <div
                        key={idx}
                        className={classNames(
                            pill
                                ? 'rounded-xl bg-night border border-slateX-800 px-3 py-2 flex items-center gap-2'
                                : 'rounded-xl bg-night border border-slateX-800 p-2',
                        )}
                    >
                        <InlineEditable
                            value={it}
                            onChange={(v) => updateItem(idx, v)}
                            className={classNames(
                                'text-slateX-200 text-sm flex-1',
                                itemClassName,
                            )}
                        />
                        <button
                            className="text-xs text-slateX-400 hover:text-white"
                            onClick={() => removeItem(idx)}
                            aria-label="Remove"
                            title="Remove"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            <button
                className="text-xs rounded-lg bg-slateX-800 text-slateX-200 px-2 py-1 hover:bg-slateX-700"
                onClick={addItem}
            >
                + Add
            </button>
        </div>
    );
}

/** Editable color swatches with hex inputs. */
function ColorPaletteEditor({
    colors,
    onChange,
}: {
    colors: string[];
    onChange: (next: string[]) => void;
}) {
    const update = (idx: number, hex: string) => {
        const norm = hex.startsWith('#') ? hex : `#${hex}`;
        const next = [...colors];
        next[idx] = norm;
        onChange(next);
    };

    return (
        <div className="p-5 grid grid-cols-5 gap-3">
            {colors.map((c, idx) => (
                <div
                    key={idx}
                    className="flex flex-col items-center gap-2"
                    title="Click code to edit"
                >
                    <div
                        className="h-12 w-12 rounded-xl border border-slateX-800"
                        style={{ backgroundColor: c }}
                    />
                    <InlineEditable
                        value={c}
                        onChange={(v) => update(idx, v)}
                        className="text-xs text-slateX-400 text-center"
                    />
                </div>
            ))}
        </div>
    );
}

/** Editable moodboard tiles with image URL inputs (no external libs). */
function MoodboardEditor({
    tiles,
    onChange,
}: {
    tiles: string[];
    onChange: (next: string[]) => void;
}) {
    const update = (idx: number, url: string) => {
        const next = [...tiles];
        next[idx] = url;
        onChange(next);
    };

    return (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-3 bg-night/40">
            {tiles.map((url, idx) => (
                <div
                    key={idx}
                    className="aspect-[4/5] rounded-xl bg-slateX-800 relative overflow-hidden border border-slateX-800"
                >
                    {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={url}
                            alt={`mood-${idx + 1}`}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 grid place-items-center text-slateX-400 text-xs">
                            mood_{String(idx + 1).padStart(2, '0')}.jpg
                        </div>
                    )}
                    <div className="absolute inset-x-1 bottom-1 flex gap-1">
                        <input
                            type="url"
                            placeholder="Image URL"
                            value={url}
                            onChange={(e) => update(idx, e.target.value)}
                            className="flex-1 rounded-lg bg-night/80 border border-slateX-700 px-2 py-1 text-xs text-slateX-100 placeholder-slateX-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        <button
                            className="rounded-lg bg-night/80 text-slateX-200 text-xs px-2 border border-slateX-700 hover:bg-night"
                            onClick={() => update(idx, '')}
                            title="Clear"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Page() {
    // Basics (left panel)
    const [client, setClient] = useState('Acme Nutrition');
    const [campaign, setCampaign] = useState('Winter Launch 2025');
    const [targetMood, setTargetMood] = useState('Calm & Trustworthy');
    const [primaryGoal, setPrimaryGoal] = useState('Leads');
    const [tonePreference, setTonePreference] = useState('Friendly');
    const [outputCaptions, setOutputCaptions] = useState('3 variations');

    // Preview state (editable)
    const [previewTitle, setPreviewTitle] = useState('Concept Board');
    const [moodboardTiles, setMoodboardTiles] = useState<string[]>(
        Array.from({ length: 6 }, () => ''),
    );
    const [colors, setColors] = useState<string[]>([
        '#0F172A',
        '#14B8A6',
        '#F59E0B',
        '#475569',
        '#94A3B8',
    ]);
    const [coreAngle, setCoreAngle] = useState(
        '“Progress you can actually stick to” — focus on consistency, calm motivation, and small wins.',
    );
    const [hooks, setHooks] = useState<string[]>([
        'Belonging',
        'Self-efficacy',
        'Trust',
        'Momentum',
    ]);
    const [copyCards, setCopyCards] = useState<CopyCard[]>([
        {
            label: 'Pattern A',
            title: 'Empathy → Proof → Soft CTA',
            body:
                '“Tired of stop-start routines? Real nutrition that fits your day. Try it for a week.”',
        },
        {
            label: 'Pattern B',
            title: 'Micro-Win Promise',
            body:
                '“Feel lighter in 7 days—no crashes, no pressure. Small changes, big results.”',
        },
        {
            label: 'Pattern C',
            title: 'Objection Flip',
            body:
                '“No time? This takes 30 seconds. Your future self will thank you.”',
        },
    ]);
    const [captions, setCaptions] = useState<string[]>([
        '“Clean energy. Real nutrients. Feel the difference in 7 days.”',
        '“Stop chasing hype. Start building habits that last.”',
        '“Progress without pressure. That’s the promise.”',
        '“Trusted by people who want results—minus the burnout.”',
    ]);
    const [directions, setDirections] = useState<Direction[]>([
        {
            title: '“Morning Routine”',
            bullets: ['Human + product in context', 'Soft daylight, minimal props', 'CTA: “Start small today”'],
        },
        {
            title: '“Micro-Wins Carousel”',
            bullets: ['5 frames = 5 benefits', 'Badge proof + short copy', 'CTA on every slide'],
        },
        {
            title: '“Founder Trust Shot”',
            bullets: ['30s talking head + overlay', 'Guarantee line in frame 1', 'CTA: “Try for 7 days”'],
        },
    ]);

    const derivedRefCount = useMemo(
        () => (moodboardTiles.filter(Boolean).length || 3), // fallback “3 references” look
        [moodboardTiles],
    );

    return (
        <>
            {/* Top Bar */}
            <header className="sticky top-0 z-30 border-b border-slateX-800 bg-night/80 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-teal-500 grid place-items-center shadow-soft">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-night" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 12c0-4.418 3.582-8 8-8a8 8 0 0 1 7.07 11.313l1.744 1.744-1.414 1.414-1.48-1.48A8 8 0 1 1 4 12zm8-6a6 6 0 1 0 4.243 10.243A6 6 0 0 0 12 6z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-white font-semibold tracking-wide">Adalyze AI</div>
                            <div className="text-slateX-400 text-xs -mt-0.5">Campaign Concept Board Generator</div>
                        </div>
                    </div>
                    <nav className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg text-sm bg-cloud text-slateX-200 hover:bg-slateX-800">Dashboard</button>
                        <button className="px-3 py-1.5 rounded-lg text-sm bg-teal-500 text-night font-medium hover:bg-teal-400 shadow-soft">
                            New Concept Board
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-7xl px-4 py-8">
                {/* Stepper */}
                <ol className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
                    {['Select Client', 'Select Campaign', 'Add References', 'Generate Preview'].map((label, idx) => (
                        <li key={idx} className="flex items-center gap-3 rounded-xl bg-black p-3">
                            <span className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-white font-semibold">{idx + 1}</span>
                            <div>
                                <div className="text-sm text-slateX-300">Step {idx + 1}</div>
                                <div className="font-medium text-white">{label}</div>
                            </div>
                        </li>
                    ))}
                </ol>

                {/* Builder Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Inputs (static shell, ready to wire) */}
                    <section className="lg:col-span-2 space-y-6">
                        {/* Basics */}
                        <div className="rounded-2xl bg-black p-5">
                            <h3 className="text-white font-semibold mb-4">Basics</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm text-white mb-1">Client</label>
                                    <div className="flex gap-2">
                                        <Select value={client} onValueChange={setClient}>
                                            <SelectTrigger className="w-full py-5 bg-[#171717] text-white">
                                                <SelectValue placeholder="Select client" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717] text-white">
                                                <SelectItem value="Acme Nutrition">Acme Nutrition</SelectItem>
                                                <SelectItem value="Brio Dental">Brio Dental</SelectItem>
                                                <SelectItem value="Nova Fitness">Nova Fitness</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            variant="ghost"
                                            className="rounded-xl text-sm text-white px-3 hover:bg-slateX-700"
                                        >
                                            <PlusIcon className="w-4 h-4" /> New
                                        </Button> 
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-white mb-1">Campaign</label>
                                    <div className="flex gap-2">
                                        <Select value={campaign} onValueChange={setCampaign}>
                                            <SelectTrigger className="w-full py-5 bg-[#171717] text-white">
                                                <SelectValue placeholder="Select campaign" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717] text-white">

                                                <SelectItem value="Winter Launch 2025">Winter Launch 2025</SelectItem>
                                                <SelectItem value="Lead Gen – Free Trial">Lead Gen – Free Trial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            className="rounded-xl text-sm text-white px-3 hover:bg-slateX-700"
                                        >
                                            <PlusIcon className="w-4 h-4" /> New
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* References Upload (static UI; you can wire uploads/links) */}
                        <div className="rounded-2xl bg-black p-5">
                            <h3 className="text-white font-semibold mb-1">Reference Ads</h3>
                            <p className="text-sm text-white/80 mb-4">
                                Upload 3–5 ad images/screenshots or paste links (Instagram, Facebook Ad Library, etc.).
                            </p>
                            <div className="grid gap-3">
                                <div className="rounded-2xl border-2 border-dashed border-white/20 bg-[#171717] p-6 text-center cursor-pointer">
                                    <div className="mx-auto mb-3 h-14 w-14 grid place-items-center">
                                        <UploadIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-white/80">
                                        Drag & drop files here <span className="text-white/50">or</span>{' '}
                                        <button className="underline underline-offset-4 decoration-primary hover:text-white">browse</button>
                                    </p>
                                    <p className="text-xs text-white/50 mt-1">PNG, JPG up to 10MB each</p>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="Paste ad link (e.g., https://www.instagram.com/p/…)"
                                        className="flex-1 rounded-xl bg-[#171717] px-3 py-2.5 text-white placeholder-white/50"
                                    />
                                    <Button variant="ghost" className=" px-4 text-sm">Add</Button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {['ref_ad_01.jpg', 'ref_ad_02.jpg', 'ig_link_03'].map((name) => (
                                        <div key={name} className="relative group rounded-xl overflow-hidden bg-[#171717] aspect-[4/5]">
                                            <div className="absolute inset-0 grid place-items-center text-white/80 text-xs">{name}</div>
                                            <Button variant="ghost" className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-500 px-1 py-1 text-xs">
                                                <TrashIcon className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Generation Options (static shell) */}
                        <div className="rounded-2xl bg-black p-5">
                            <h3 className="text-white font-semibold mb-4">AI Generation Options</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white mb-1">Target Mood</label>
                                    <Select value={targetMood} onValueChange={setTargetMood}>
                                        <SelectTrigger className="w-full py-5 bg-[#171717] text-white">
                                            <SelectValue placeholder="Select target mood" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#171717] text-white">
                                            <SelectItem value="Calm & Trustworthy">Calm & Trustworthy</SelectItem>
                                            <SelectItem value="Bold & Energetic">Bold & Energetic</SelectItem>
                                            <SelectItem value="Minimal & Premium">Minimal & Premium</SelectItem>
                                            <SelectItem value="Playful & Youthful">Playful & Youthful</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slateX-300 mb-1">Primary Goal</label>
                                    <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                                        <SelectTrigger className="w-full py-5 bg-[#171717] text-white">
                                            <SelectValue placeholder="Select primary goal" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#171717] text-white">
                                        <SelectItem value="Leads">Leads</SelectItem>
                                        <SelectItem value="Sales">Sales</SelectItem>
                                        <SelectItem value="Awareness">Awareness</SelectItem>
                                        <SelectItem value="Retention">Retention</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slateX-300 mb-1">Tone Preference</label>
                                    <Select value={tonePreference} onValueChange={setTonePreference}>
                                        <SelectTrigger className="w-full py-5 bg-[#171717] text-white">
                                            <SelectValue placeholder="Select tone preference" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#171717] text-white">
                                            <SelectItem value="Friendly">Friendly</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Aggressive">Aggressive</SelectItem>
                                        <SelectItem value="Luxury Minimal">Luxury Minimal</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slateX-300 mb-1">Output Captions</label>
                                    <Select value={outputCaptions} onValueChange={setOutputCaptions}>
                                        <SelectTrigger className="w-full py-5 bg-[#171717] text-white">
                                            <SelectValue placeholder="Select output captions" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#171717] text-white">
                                            <SelectItem value="3 variations">3 variations</SelectItem>
                                            <SelectItem value="5 variations">5 variations</SelectItem>
                                        <SelectItem value="10 variations">10 variations</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center justify-between gap-3">
                                <div className="text-xs text-slateX-400">Tip: Better references → sharper mood & angles.</div>
                                <Button className="inline-flex items-center gap-2 text-white font-semibold px-4 py-2.5 hover:bg-teal-400 shadow-soft">
                                    <ArrowRightIcon className="w-4 h-4" />
                                    Generate Board
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Right: Preview (fully editable) */}
                    <section className="lg:col-span-3">
                        <div className="rounded-2xl bg-black overflow-hidden">
                            {/* Preview Header */}
                            <div className="flex items-center justify-between px-5 py-4">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-white">Preview</div>
                                    <h3 className="text-white font-semibold">
                                        <InlineEditable
                                            value={previewTitle}
                                            onChange={setPreviewTitle}
                                            className="inline"
                                        />{' '}
                                        — <span className="text-teal-400">{client} · {campaign}</span>
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-2 rounded-lg bg-slateX-800 text-slateX-200 text-sm">Copy Client Link</button>
                                    <button className="px-3 py-2 rounded-lg bg-slateX-800 text-slateX-200 text-sm">Download PDF</button>
                                    <button className="px-3 py-2 rounded-lg bg-teal-500 text-night font-medium shadow-soft text-sm">Save Board</button>
                                </div>
                            </div>

                            {/* Preview Body */}
                            <div className="p-5 grid gap-6">
                                {/* Moodboard */}
                                <div className="rounded-2xl border border-slateX-800 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-slateX-800 flex items-center justify-between">
                                        <h4 className="font-semibold text-white">Visual Moodboard</h4>
                                        <span className="text-xs text-slateX-400">Derived from {derivedRefCount} references</span>
                                    </div>
                                    <MoodboardEditor tiles={moodboardTiles} onChange={setMoodboardTiles} />
                                </div>

                                {/* Colors & Typography */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="rounded-2xl border border-slateX-800 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slateX-800">
                                            <h4 className="font-semibold text-white">Color Palette</h4>
                                        </div>
                                        <ColorPaletteEditor colors={colors} onChange={setColors} />
                                    </div>

                                    <div className="rounded-2xl border border-slateX-800 overflow-hidden md:col-span-2">
                                        <div className="px-5 py-3 border-b border-slateX-800">
                                            <h4 className="font-semibold text-white">Message Angle & Emotional Hooks</h4>
                                        </div>
                                        <div className="p-5 grid md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs uppercase tracking-wider text-slateX-400 mb-2">Core Angle</div>
                                                <div className="rounded-xl bg-night border border-slateX-800 p-4">
                                                    <InlineEditable
                                                        value={coreAngle}
                                                        onChange={setCoreAngle}
                                                        multiline
                                                        className="text-slateX-200"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs uppercase tracking-wider text-slateX-400 mb-2">Emotional Hooks</div>
                                                <EditableList items={hooks} onChange={setHooks} pill />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Copy Directions */}
                                <div className="rounded-2xl border border-slateX-800 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-slateX-800 flex items-center justify-between">
                                        <h4 className="font-semibold text-white">Ad Copy Direction</h4>
                                        <span className="text-xs text-slateX-400">
                                            {copyCards.length} suggested pattern{copyCards.length === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4 p-5">
                                        {copyCards.map((card, idx) => (
                                            <div key={idx} className="rounded-xl bg-night border border-slateX-800 p-4">
                                                <div className="text-slateX-300 text-xs mb-1">
                                                    <InlineEditable value={card.label} onChange={(v) => {
                                                        const next = [...copyCards];
                                                        next[idx] = { ...next[idx], label: v };
                                                        setCopyCards(next);
                                                    }} />
                                                </div>
                                                <h5 className="font-medium text-white mb-2">
                                                    <InlineEditable value={card.title} onChange={(v) => {
                                                        const next = [...copyCards];
                                                        next[idx] = { ...next[idx], title: v };
                                                        setCopyCards(next);
                                                    }} />
                                                </h5>
                                                <InlineEditable
                                                    value={card.body}
                                                    onChange={(v) => {
                                                        const next = [...copyCards];
                                                        next[idx] = { ...next[idx], body: v };
                                                        setCopyCards(next);
                                                    }}
                                                    multiline
                                                    className="text-slateX-300 text-sm"
                                                />
                                                <div className="mt-2 flex justify-between">
                                                    <button
                                                        className="text-xs rounded-lg bg-slateX-800 text-slateX-200 px-2 py-1 hover:bg-slateX-700"
                                                        onClick={() => {
                                                            const next = [...copyCards];
                                                            next.splice(idx, 1);
                                                            setCopyCards(next);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                    {idx === copyCards.length - 1 && (
                                                        <button
                                                            className="text-xs rounded-lg bg-slateX-800 text-slateX-200 px-2 py-1 hover:bg-slateX-700"
                                                            onClick={() =>
                                                                setCopyCards([
                                                                    ...copyCards,
                                                                    { label: `Pattern ${String.fromCharCode(65 + copyCards.length)}`, title: 'New Title', body: 'New body' },
                                                                ])
                                                            }
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Caption Suggestions */}
                                <div className="rounded-2xl border border-slateX-800 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-slateX-800 flex items-center justify-between">
                                        <h4 className="font-semibold text-white">Caption Suggestions</h4>
                                        <span className="text-xs text-slateX-400">Ready to copy</span>
                                    </div>
                                    <div className="p-5 grid md:grid-cols-2 gap-4">
                                        {captions.map((c, idx) => (
                                            <div key={idx} className="rounded-xl bg-night border border-slateX-800 p-4 text-sm text-slateX-200">
                                                <InlineEditable
                                                    value={c}
                                                    onChange={(v) => {
                                                        const next = [...captions];
                                                        next[idx] = v;
                                                        setCaptions(next);
                                                    }}
                                                    multiline
                                                />
                                                <div className="mt-2 flex justify-between">
                                                    <button
                                                        className="text-xs rounded-lg bg-slateX-800 text-slateX-200 px-2 py-1 hover:bg-slateX-700"
                                                        onClick={() => {
                                                            const next = [...captions];
                                                            next.splice(idx, 1);
                                                            setCaptions(next);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                    {idx === captions.length - 1 && (
                                                        <button
                                                            className="text-xs rounded-lg bg-slateX-800 text-slateX-200 px-2 py-1 hover:bg-slateX-700"
                                                            onClick={() => setCaptions([...captions, 'New caption'])}
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Creative Directions */}
                                <div className="rounded-2xl border border-slateX-800 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-slateX-800">
                                        <h4 className="font-semibold text-white">Creative Direction (Try these 3)</h4>
                                    </div>
                                    <div className="p-5 grid md:grid-cols-3 gap-4">
                                        {directions.map((d, idx) => (
                                            <div key={idx} className="rounded-xl bg-night border border-slateX-800 p-4">
                                                <div className="text-slateX-300 text-xs mb-1">Direction {idx + 1}</div>
                                                <h5 className="font-medium text-white mb-2">
                                                    <InlineEditable value={d.title} onChange={(v) => {
                                                        const next = [...directions];
                                                        next[idx] = { ...next[idx], title: v };
                                                        setDirections(next);
                                                    }} />
                                                </h5>
                                                <EditableList
                                                    items={d.bullets}
                                                    onChange={(list) => {
                                                        const next = [...directions];
                                                        next[idx] = { ...next[idx], bullets: list };
                                                        setDirections(next);
                                                    }}
                                                    itemClassName="text-sm"
                                                />
                                                <div className="mt-2 flex justify-between">
                                                    <button
                                                        className="text-xs rounded-lg bg-slateX-800 text-slateX-200 px-2 py-1 hover:bg-slateX-700"
                                                        onClick={() => {
                                                            const next = [...directions];
                                                            next.splice(idx, 1);
                                                            setDirections(next);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                    {idx === directions.length - 1 && (
                                                        <button
                                                            className="text-xs rounded-lg bg-slateX-800 text-slateX-200 px-2 py-1 hover:bg-slateX-700"
                                                            onClick={() =>
                                                                setDirections([...directions, { title: 'New Direction', bullets: ['Point 1'] }])
                                                            }
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-end gap-2 pb-4">
                                    <button className="px-3 py-2 rounded-lg bg-slateX-800 text-slateX-200 text-sm">Back</button>
                                    <button className="px-3 py-2 rounded-lg bg-teal-500 text-night font-medium shadow-soft text-sm">
                                        Approve & Publish
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Tiny helper note */}
                <p className="mt-6 text-xs text-slateX-500">
                    UI mock: non-functional controls for reference. Hook your upload, link-parse, and generation flows to these elements.
                </p>
            </main>

            <footer className="mx-auto max-w-7xl px-4 pb-10 pt-6 text-slateX-500 text-xs">
                © 2025 Adalyze AI — Concept Board Generator UI mock
            </footer>
        </>
    );
}
