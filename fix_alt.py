#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_alt.py — يضبط alt بالعربي لكل صور موقع PROPOOL (لتحسين السيو وإمكانية الوصول)

الاستخدام:
  1) حط الملف ده في فولدر الموقع (جنب index.html)
  2) شغّل:   python fix_alt.py
  3) بيعدّل index.html و services.html و projects.html
     وبيعمل نسخة احتياطية قبل أي تعديل (index.html.bak ...)

الوضع الافتراضي (آمن): بيصلّح بس الـ alt الناقص أو الإنجليزي أو القصير جدًا أو
المكرر على أكتر من صورة، ومبيلمسش أي alt عربي كويس كتبته بإيديك.
الـ alt الفاضي (alt="") بيسيبه زي ما هو لأنه بيعني صورة ديكور.
لو عايز يستبدل كل الـ alt بالقاموس: python fix_alt.py . --force

الوصف بيتحدد من اسم ملف الصورة. لو غيّرت اسم صورة أو ضفت صورة جديدة
ضيفها في القاموس ALT تحت، وشغّل السكريبت تاني.
"""
import os
import re
import shutil
import sys
from urllib.parse import unquote

PAGES = ["index.html", "services.html", "projects.html"]

# ---------------------------------------------------------------
#  اسم ملف الصورة  ->  alt بالعربي
# ---------------------------------------------------------------
ALT = {
    # --- الشعار ---
    "Assetw.png":       "شعار بروبول PROPOOL لإنشاء وصيانة جميع أنواع المسابح في الكويت",
    "Asset wihte.png":  "شعار بروبول PROPOOL النسخة البيضاء",

    # --- مشاريع الفلل ---
    "ابوعبدالعزيز.webp":  "مسبح داخلي بتشطيب فسيفساء وسلم ستانلس في فيلا ابوعبدالعزيز بمنطقة اليرموك في الكويت",
    "جاسم الربيعي.webp":  "مسبح بتشطيب بلاط أزرق ودرج داخلي في فيلا جاسم الربيعي بمنطقة ابو فطيرة في الكويت",
    "حسن الكندري.webp":   "مسبح مستطيل بتشطيب فسيفساء زرقاء وإضاءة LED في فيلا حسن الكندري بمنطقة القرين في الكويت",
    "منذر.webp":          "مسبح بشلال مائي وسلم ستانلس محاط بالعشب في فيلا منذر بمنطقة الشهداء في الكويت",
    "cover image2.webp":  "مسبح بشلال مائي وسلم ستانلس محاط بالعشب في فيلا بالكويت",

    # --- قبل وبعد ---
    "before.webp":  "أرض عشبية فارغة بجانب فيلا قبل البدء في إنشاء المسبح",
    "after2.webp":  "مسبح فيلا فاخر بعد التنفيذ مع إضاءة المساء والنخيل والحديقة في الكويت",
    "after2.png":   "مسبح فيلا فاخر بعد التنفيذ مع إضاءة المساء والنخيل والحديقة في الكويت",

    # --- صور عامة / معرض الصور ---
    "heroimage.jpg": "مسبح في حديقة فيلا مع جلسة خارجية عند الغروب في الكويت",
    "pool-1.webp":   "شلال مائي مدمج مع مسبح بتشطيب فسيفساء زرقاء",
    "pool-2.webp":   "فني من فريق بروبول يعمل على تركيب وصيانة معدات المسبح",
    "pool-3.webp":   "مسبح قبل وبعد التنظيف والمعالجة: مياه خضراء متسخة مقابل مياه زرقاء نقية",
    "pool-4.webp":   "لوحة تحكم كهربائية لمعدات المسبح أثناء التركيب",
    "pool-5.webp":   "مسبح أثناء أعمال العزل والتشطيب بدهان أزرق قبل تعبئته بالمياه",
    "pool-6.webp":   "قاع مسبح بتشطيب فسيفساء داكن وألعاب مائية عائمة في فيلا بالكويت",
    "pool-7.webp":   "لوحة كهرباء وقواطع حماية لمضخات وأنظمة المسبح",
    "pool-8.webp":   "أحد أعضاء فريق بروبول بجانب جدار حجري في موقع مشروع مسبح",
    "pool-9.webp":   "حديد التسليح لهيكل مسبح قيد الإنشاء مع عمال في الموقع",
    "project-1.webp": "قاع مسبح بتشطيب فسيفساء داكن وألعاب مائية عائمة في فيلا بالكويت",
    "project-2.webp": "مسبح بيضاوي بتشطيب فسيفساء زرقاء وسلم أبيض في حديقة فيلا بالكويت",
    "project-3.webp": "مسبح مغطى ضيق بتشطيب بلاط تركوازي ودرج داخلي في الكويت",
    "project-4.webp": "مسبح أثناء أعمال العزل والتشطيب بدهان أزرق قبل تعبئته بالمياه",

    # --- صفحة الخدمات ---
    "svc-design-poster.webp":         "تشطيب بلاط فسيفساء بدرجات الأزرق لجدار مسبح",
    "svc-construction.webp":          "عمال يجهزون حديد التسليح لإنشاء مسبح جديد في الكويت",
    "svc-renovation.webp":            "مسبح قبل وبعد الترميم والتنظيف: مياه خضراء ثم مياه زرقاء صافية",
    "svc-maintenance-poster.webp":    "خرطوم تنظيف يُستخدم في صيانة وتنظيف مسبح",
    "svc-water-features-poster.webp": "شلال مائي يصب في مسبح بتشطيب فسيفساء زرقاء",
    "svc-equipment.webp":             "غرفة معدات مسبح بأنابيب وصمامات تحكم ومضخات",
    "svc-jacuzzi.webp":               "جاكوزي مدمج في مسبح فيلا مع نفاثات مائية في الكويت",
}

# صور خارجية (صور آراء العملاء من Unsplash)
EXTERNAL_ALT = "صورة العميل"

# الفيديوهات: aria-label (بديل الـ alt للفيديو)
VIDEO_LABEL = {
    "ved-1.mp4": "فيديو لمسبح وشلال ومسبح أطفال مدمج في فيلا ابو سليمان بمنطقة الروضة في الكويت",
    "ved-2.mp4": "فيديو لمسبح ونافورة في فيلا المهندس عادل النعمة بمنطقة غرب عبدالله المبارك في الكويت",
}

LIGHTBOX_ALT = "معاينة صورة من معرض أعمال بروبول للمسابح في الكويت"

IMG_RE = re.compile(r"<img\b[^>]*>", re.I | re.S)
VIDEO_RE = re.compile(r"<video\b[^>]*>.*?</video>", re.I | re.S)


AR = re.compile(r"[\u0600-\u06FF]")
MIN_LEN = 25   # alt أقصر من كده (بالحروف) بنعتبره ضعيف


def get_attr(tag, name):
    m = re.search(r'\b%s\s*=\s*"([^"]*)"' % name, tag, re.I)
    return m.group(1) if m else None


def set_attr(tag, name, value):
    value = value.replace('"', "&quot;")
    if re.search(r'\b%s\s*=\s*"[^"]*"' % name, tag, re.I):
        return re.sub(r'(\b%s\s*=\s*)"[^"]*"' % name,
                      lambda m: '%s"%s"' % (m.group(1), value), tag, count=1, flags=re.I)
    # ما فيش attribute: نضيفه قبل نهاية الوسم
    return re.sub(r"\s*/?>$", ' %s="%s">' % (name, value), tag)


def process(path, force=False):
    with open(path, encoding="utf-8") as f:
        html = f.read()
    original = html

    # مكان البري لودر (صورته ديكور: alt فاضي)
    pre_start = html.find('id="preloader"')
    pre_end = html.find('class="pl-ring"') if pre_start != -1 else -1

    changed, unknown, kept_empty = [], [], []

    # alt مكرر على أكتر من صورة مختلفة = ضعيف للسيو
    alt_srcs = {}
    for t in IMG_RE.findall(html):
        a, sr = get_attr(t, "alt"), get_attr(t, "src")
        if a and sr:
            alt_srcs.setdefault(a, set()).add(sr)
    duplicated = {a for a, v in alt_srcs.items() if len(v) > 1}

    def needs_fix(old):
        if old is None:
            return True
        if old == "":
            return False                       # ديكور: نسيبه
        return (not AR.search(old)) or len(old) < MIN_LEN or old in duplicated

    def img_repl(m):
        tag = m.group(0)
        src = get_attr(tag, "src") or ""
        pos = m.start()

        if pre_start != -1 and pre_start < pos < pre_end:
            new = set_attr(tag, "alt", "")
            return new

        if get_attr(tag, "id") == "lbImg":
            alt = LIGHTBOX_ALT
        elif src.startswith("http"):
            alt = EXTERNAL_ALT
        elif not src:
            return tag            # صورة بيتحدد مصدرها من الـ JS
        else:
            name = os.path.basename(unquote(src.split("?")[0]))
            alt = ALT.get(name)
            if alt is None:
                unknown.append(name)
                return tag

        old = get_attr(tag, "alt")
        if old == "" and not force:
            kept_empty.append(os.path.basename(unquote(src)))
            return tag
        if old != alt and (force or needs_fix(old)):
            changed.append((os.path.basename(unquote(src)) or "lightbox", old, alt))
            return set_attr(tag, "alt", alt)
        return tag

    html = IMG_RE.sub(img_repl, html)

    def video_repl(m):
        block = m.group(0)
        sm = re.search(r'<source[^>]*src="([^"]+)"', block, re.I)
        if not sm:
            return block
        name = os.path.basename(unquote(sm.group(1)))
        label = VIDEO_LABEL.get(name)
        if not label:
            unknown.append(name)
            return block
        opening = re.match(r"<video\b[^>]*>", block, re.I | re.S).group(0)
        new_open = opening
        if force or not get_attr(opening, "aria-label"):
            new_open = set_attr(opening, "aria-label", label)
        if new_open != opening:
            changed.append((name, get_attr(opening, "aria-label"), label))
        return new_open + block[len(opening):]

    html = VIDEO_RE.sub(video_repl, html)

    if html != original:
        shutil.copyfile(path, path + ".bak")
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
    return changed, sorted(set(unknown)), sorted(set(kept_empty))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    folder = args[0] if args else "."
    for page in PAGES:
        path = os.path.join(folder, page)
        if not os.path.exists(path):
            print("- %s: مش موجود، اتخطى" % page)
            continue
        changed, unknown, kept_empty = process(path, force)
        print("\n== %s: اتعدّل %d alt" % (page, len(changed)))
        for name, old, new in changed:
            print("   %-32s | قبل: %s" % (name, old if old is not None else "(مفيش alt)"))
        if kept_empty:
            print("   (alt فاضي اتسابت زي ما هي كصور ديكور: %d)" % len(kept_empty))
        if unknown:
            print("   ⚠ صور مش في القاموس (ضيفها في ALT): " + ", ".join(unknown))
    print("\nخلصنا. النسخ الاحتياطية بامتداد .bak")


if __name__ == "__main__":
    main()
