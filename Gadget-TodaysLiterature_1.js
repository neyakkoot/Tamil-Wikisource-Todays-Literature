/************************************************************
 * தமிழ் விக்கிமூலம்
 * இன்றைய இலக்கியம் – நூல் அறிமுகக் கருவி
 *
 * Developer: Neyakkoo
 * Platform: Tamil Wikisource
 * Skin: Vector 2022
 ************************************************************/

(function () {
    'use strict';

    // ======================================================
    // 1. அடிப்படை அமைப்புகள்
    // ======================================================

    var api = null;

    // நூல் அறிமுகம் சேர்க்கப்படும் இலக்குப் பக்கம்.
    // உங்கள் விக்கிமூலத்தின் உண்மையான பக்கப்பெயருக்கு ஏற்ப மாற்றவும்.
    var TARGET_PAGE = 'விக்கிமூலம்:இன்றைய_இலக்கியம்';

    var BUTTON_ID = 'tl-main-button';
    var OVERLAY_ID = 'tl-overlay';

    // ======================================================
    // 2. CSS வடிவமைப்பு
    // ======================================================

    function addStyles() {
        if (document.getElementById('tl-style')) return;

        var style = document.createElement('style');
        style.id = 'tl-style';

        style.textContent = `
        #tl-main-button {
            background: #00a88f;
            color: white;
            border: none;
            border-radius: 7px;
            padding: 12px 20px;
            margin: 12px 0;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 5px #0003;
        }

        #tl-main-button:hover {
            background: #008c78;
        }

        .tl-overlay {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: rgba(0,0,0,.65);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
        }

        .tl-window {
            width: min(850px, 96vw);
            max-height: 90vh;
            overflow-y: auto;
            background: #fff;
            color: #202122;
            padding: 22px;
            border-radius: 10px;
            box-shadow: 0 5px 30px #0005;
        }

        .tl-window h2 {
            color: #0645ad;
            border-bottom: 2px solid #36c;
            padding-bottom: 12px;
        }

        .tl-window h3 {
            margin-top: 20px;
        }

        .tl-window label {
            display: block;
            font-weight: bold;
            margin-top: 13px;
        }

        .tl-window input,
        .tl-window textarea,
        .tl-window select {
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            margin-top: 5px;
            border: 1px solid #a2a9b1;
            border-radius: 5px;
            font-size: 14px;
            background: white;
            color: #202122;
        }

        .tl-window textarea {
            resize: vertical;
        }

        .tl-window button {
            padding: 9px 15px;
            margin: 5px 3px;
            border: 1px solid #72777d;
            border-radius: 5px;
            cursor: pointer;
        }

        .tl-primary {
            background: #008f7a;
            color: white;
            border-color: #008f7a !important;
        }

        .tl-primary:hover {
            background: #006e60;
        }

        .tl-results {
            border: 1px solid #a2a9b1;
            max-height: 190px;
            overflow-y: auto;
            margin-top: 10px;
        }

        .tl-results button {
            display: block;
            width: 100%;
            text-align: left;
            background: white;
            color: #0645ad;
            border: none;
            border-bottom: 1px solid #eaecf0;
            padding: 10px;
            margin: 0;
        }

        .tl-results button:hover {
            background: #eaecf0;
        }

        .tl-status {
            padding: 10px;
            background: #f1f5f9;
            border-left: 4px solid #008f7a;
            margin-top: 12px;
        }

        .tl-preview {
            background: #f8f9fa;
            padding: 15px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            border: 1px solid #a2a9b1;
            max-height: 250px;
            overflow-y: auto;
        }

        .tl-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 15px;
        }

        .tl-note {
            color: #54595d;
            font-size: 13px;
        }

        @media(max-width:600px) {
            .tl-window {
                padding: 12px;
            }
        }
        `;

        document.head.appendChild(style);
    }

    // ======================================================
    // 3. உதவிச் செயல்பாடுகள்
    // ======================================================

    function getElement(id) {
        return document.getElementById('tl-' + id);
    }

    function setStatus(message) {
        var element = getElement('status');

        if (element) {
            element.textContent = message;
        }
    }

    function cleanText(text) {
        return String(text || '').trim();
    }

    // ======================================================
    // 4. கருவியைத் திறத்தல்
    // ======================================================

    function createTool() {

        if (document.getElementById(OVERLAY_ID)) return;

        addStyles();

        var overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.className = 'tl-overlay';

        var box = document.createElement('div');
        box.className = 'tl-window';

        box.innerHTML = `
            <h2>📚 இன்றைய இலக்கியம்</h2>

            <p>
            தமிழ் விக்கிமூலத்தில் ஏற்கெனவே உருவாக்கப்பட்ட
            நூல்களைத் தேர்ந்தெடுத்து அவற்றை அறிமுகப்படுத்துங்கள்.
            </p>

            <p class="tl-note">
            நூல் விவரங்களை மூல நூலுடன் ஒப்பிட்டுச் சரிபார்க்கவும்.
            </p>

            <hr>

            <h3>1. நூலைத் தேடுதல்</h3>

            <input id="tl-search"
                placeholder="நூலின் பெயரை உள்ளிடவும்">

            <button id="tl-find" class="tl-primary">
                🔍 நூலைத் தேடு
            </button>

            <div id="tl-results" class="tl-results"></div>

            <div id="tl-status" class="tl-status">
                நூலின் பெயரை உள்ளிட்டு தேடவும்.
            </div>

            <hr>

            <h3>2. நூல் விவரங்கள்</h3>

            <label>நூலின் தலைப்பு *</label>
            <input id="tl-title" placeholder="நூலின் தலைப்பு">

            <label>ஆசிரியர்</label>
            <input id="tl-author" placeholder="ஆசிரியரின் பெயர்">

            <label>வெளியீட்டு ஆண்டு</label>
            <input id="tl-year" placeholder="எ.கா. 1920">

            <label>பதிப்பகம் / அச்சகம்</label>
            <input id="tl-publisher">

            <label>நூல் வகை</label>
            <select id="tl-type">
                <option value="">தேர்ந்தெடுக்கவும்</option>
                <option>கவிதை</option>
                <option>சிறுகதை</option>
                <option>நாவல்</option>
                <option>கட்டுரை</option>
                <option>நாடகம்</option>
                <option>இலக்கணம்</option>
                <option>இலக்கியம்</option>
                <option>வரலாறு</option>
                <option>வாழ்க்கை வரலாறு</option>
                <option>மொழிபெயர்ப்பு</option>
                <option>பிற</option>
            </select>

            <label>நூலின் அறிமுகம் *</label>
            <textarea id="tl-summary" rows="6"
                placeholder="நூலின் உள்ளடக்கம், நோக்கம், கருத்துகள் ஆகியவற்றை அறிமுகப்படுத்தவும்."></textarea>

            <label>நூலின் சிறப்புகள்</label>
            <textarea id="tl-special" rows="4"
                placeholder="நூலின் இலக்கியச் சிறப்புகள், வரலாற்று முக்கியத்துவம் போன்றவற்றை எழுதவும்."></textarea>

            <label>விக்கிமூல நூலுக்கான இணைப்பு</label>
            <input id="tl-link"
                placeholder="விக்கிமூலம்:நூலின் பெயர்">

            <hr>

            <h3>3. வெளியீட்டிற்கான அமைப்புகள்</h3>

            <label>இலக்கு விக்கிப்பக்கம்</label>
            <input id="tl-target">

            <p class="tl-note">
            வெளியிடுவதற்கு முன் இலக்குப் பக்கத்தின் பெயரை உறுதிப்படுத்தவும்.
            </p>

            <div class="tl-actions">

                <button id="tl-preview">
                    👁 முன்னோட்டம்
                </button>

                <button id="tl-copy">
                    📋 உரையை நகலெடு
                </button>

                <button id="tl-publish" class="tl-primary">
                    வெளியிடு
                </button>

                <button id="tl-close">
                    மூடு
                </button>

            </div>

            <h3>4. நூல் அறிமுக முன்னோட்டம்</h3>

            <pre id="tl-output" class="tl-preview">
முன்னோட்டம் இங்கே தோன்றும்.
            </pre>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        getElement('target').value = TARGET_PAGE;

        // ==================================================
        // 5. மூடும் வசதி
        // ==================================================

        getElement('close').onclick = function () {
            overlay.remove();
        };

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                overlay.remove();
            }
        });

        // ==================================================
        // 6. நூல்களைத் தேடுதல்
        // ==================================================

        getElement('find').onclick = async function () {

            var query = cleanText(getElement('search').value);

            if (!query) {
                setStatus('நூலின் பெயரை உள்ளிடவும்.');
                return;
            }

            setStatus('நூல்களைத் தேடுகிறது...');

            getElement('results').innerHTML = '';

            try {

                var data = await api.get({
                    action: 'query',
                    list: 'search',
                    srsearch: query,
                    srnamespace: 0,
                    srlimit: 30,
                    format: 'json'
                });

                var results = data.query.search || [];

                if (!results.length) {
                    setStatus('பொருத்தமான நூல்கள் கிடைக்கவில்லை.');
                    return;
                }

                setStatus(results.length + ' தேடல் முடிவுகள் கிடைத்துள்ளன.');

                results.forEach(function (item) {

                    var button = document.createElement('button');

                    button.textContent = item.title;

                    button.onclick = function () {
                        selectBook(item.title);
                    };

                    getElement('results').appendChild(button);

                });

            } catch (error) {

                setStatus('தேடலில் பிழை: ' + error.message);

            }
        };

        // ==================================================
        // 7. நூலைத் தேர்ந்தெடுத்து விவரங்களைப் பெறுதல்
        // ==================================================

        async function selectBook(pageTitle) {

            getElement('title').value = pageTitle;
            getElement('link').value = pageTitle;

            setStatus('நூல் விவரங்களைப் பெறுகிறது...');

            try {

                var data = await api.get({
                    action: 'query',
                    prop: 'revisions',
                    titles: pageTitle,
                    rvprop: 'content',
                    rvslots: 'main',
                    format: 'json'
                });

                var pages = data.query.pages;
                var page = Object.values(pages)[0];

                var content = '';

                if (
                    page.revisions &&
                    page.revisions[0] &&
                    page.revisions[0].slots &&
                    page.revisions[0].slots.main
                ) {
                    content =
                        page.revisions[0].slots.main.content ||
                        page.revisions[0].slots.main['*'] ||
                        '';
                }

                // பொதுவான நூல் தகவல் வார்ப்புருக்களைத் தேடுதல்

                function extract(pattern) {
                    var match = content.match(pattern);
                    return match ? match[1].trim() : '';
                }

                var author = extract(
                    /\|\s*(?:ஆசிரியர்|author)\s*=\s*([^\n|]+)/i
                );

                var year = extract(
                    /\|\s*(?:வெளியீட்டாண்டு|வெளியீட்டு ஆண்டு|ஆண்டு|year)\s*=\s*([^\n|]+)/i
                );

                var publisher = extract(
                    /\|\s*(?:பதிப்பகம்|வெளியீட்டாளர்|publisher)\s*=\s*([^\n|]+)/i
                );

                if (author) getElement('author').value = author;
                if (year) getElement('year').value = year;
                if (publisher) getElement('publisher').value = publisher;

                setStatus(
                    'நூல் தேர்ந்தெடுக்கப்பட்டது. கிடைத்த விவரங்களைச் சரிபார்த்து மீதமுள்ள தகவல்களை நிரப்பவும்.'
                );

            } catch (error) {

                setStatus(
                    'நூல் தேர்ந்தெடுக்கப்பட்டது. கூடுதல் தகவல்களை கைமுறையாக நிரப்பவும்.'
                );

            }
        }

        // ==================================================
        // 8. விக்கி உரையை உருவாக்குதல்
        // ==================================================

        function generateWikiText() {

            var title = cleanText(getElement('title').value);
            var author = cleanText(getElement('author').value);
            var year = cleanText(getElement('year').value);
            var publisher = cleanText(getElement('publisher').value);
            var type = cleanText(getElement('type').value);
            var summary = cleanText(getElement('summary').value);
            var special = cleanText(getElement('special').value);
            var link = cleanText(getElement('link').value);

            var lines = [];

            lines.push('== ' + title + ' ==');
            lines.push('');

            if (link) {
                lines.push('* ''' + 'நூல்:''' + ' [[' + link + ']]');
            }

            if (author) {
                lines.push('* ''' + 'ஆசிரியர்:''' + ' ' + author);
            }

            if (year) {
                lines.push('* ''' + 'வெளியீட்டு ஆண்டு:''' + ' ' + year);
            }

            if (publisher) {
                lines.push('* ''' + 'பதிப்பகம்:''' + ' ' + publisher);
            }

            if (type) {
                lines.push('* ''' + 'நூல் வகை:''' + ' ' + type);
            }

            lines.push('');
            lines.push('; நூல் அறிமுகம்');

            if (summary) {
                summary.split('\n').forEach(function (line) {
                    lines.push(': ' + line);
                });
            }

            if (special) {
                lines.push('');
                lines.push('; நூலின் சிறப்புகள்');

                special.split('\n').forEach(function (line) {
                    lines.push(': ' + line);
                });
            }

            lines.push('');

            return lines.join('\n');
        }

        // ==================================================
        // 9. முன்னோட்டம்
        // ==================================================

        getElement('preview').onclick = function () {

            getElement('output').textContent = generateWikiText();

            setStatus('நூல் அறிமுக முன்னோட்டம் உருவாக்கப்பட்டது.');

        };

        // ==================================================
        // 10. விக்கி உரையை நகலெடுத்தல்
        // ==================================================

        getElement('copy').onclick = async function () {

            try {

                await navigator.clipboard.writeText(
                    generateWikiText()
                );

                setStatus('விக்கி உரை நகலெடுக்கப்பட்டது.');

            } catch (error) {

                getElement('output').textContent = generateWikiText();

                setStatus(
                    'நகலெடுக்க இயலவில்லை. முன்னோட்டத்தில் இருந்து நகலெடுக்கவும்.'
                );

            }
        };

        // ==================================================
        // 11. விக்கிமூலத்தில் வெளியிடுதல்
        // ==================================================

        getElement('publish').onclick = async function () {

            var title = cleanText(getElement('title').value);
            var summary = cleanText(getElement('summary').value);
            var target = cleanText(getElement('target').value);

            if (!title || !summary) {

                alert(
                    'நூலின் தலைப்பையும் அறிமுகத்தையும் கட்டாயம் நிரப்பவும்.'
                );

                return;
            }

            if (!target) {

                alert('இலக்கு விக்கிப்பக்கத்தின் பெயரை உள்ளிடவும்.');

                return;
            }

            var confirmation = confirm(
                'நூல் அறிமுகத்தை கீழ்க்கண்ட பக்கத்தில் சேர்க்கலாமா?\n\n' +
                target +
                '\n\nவிவரங்களைச் சரிபார்த்துள்ளீர்களா?'
            );

            if (!confirmation) return;

            setStatus('விக்கிமூலத்தில் சேமிக்கிறது...');

            try {

                await api.postWithEditToken({

                    action: 'edit',

                    title: target,

                    appendtext: '\n' + generateWikiText(),

                    summary: 'இன்றைய இலக்கியம் – ' + title,

                    minor: 0

                });

                setStatus(
                    'நூல் அறிமுகம் வெற்றிகரமாகச் சேர்க்கப்பட்டது!'
                );

                alert(
                    'நூல் அறிமுகம் வெற்றிகரமாக வெளியிடப்பட்டது!'
                );

            } catch (error) {

                setStatus(
                    'சேமிப்பதில் பிழை: ' + error.message
                );

                alert(
                    'சேமிக்க இயலவில்லை.\n' +
                    'பக்கத்தின் பெயர், திருத்த அனுமதி மற்றும் API பிழையைச் சரிபார்க்கவும்.\n\n' +
                    error.message
                );

            }

        };

    }

    // ======================================================
    // 12. Vector 2022 பக்கத்தில் பொத்தானை உருவாக்குதல்
    // ======================================================

    function addMainButton() {

        if (document.getElementById(BUTTON_ID)) return;

        addStyles();

        var button = document.createElement('button');

        button.id = BUTTON_ID;

        button.type = 'button';

        button.textContent = '📚 இன்றைய இலக்கியம் – நூல் அறிமுகம்';

        button.title = 'விக்கிமூல நூல்களுக்கான அறிமுகத்தை உருவாக்கவும்';

        button.addEventListener('click', function () {

            createTool();

        });

        // Vector 2022 தலைப்புப் பகுதி

        var header = document.querySelector('.mw-body-header');

        if (header) {

            header.insertAdjacentElement('afterend', button);

        } else {

            var heading = document.querySelector('#firstHeading');

            if (heading) {

                heading.insertAdjacentElement('afterend', button);

            } else {

                document.body.prepend(button);

            }

        }

    }

    // ======================================================
    // 13. MediaWiki API ஏற்றுதல்
    // ======================================================

    mw.loader.using([
        'mediawiki.api',
        'mediawiki.util'
    ]).then(function () {

        api = new mw.Api();

        addMainButton();

    }).catch(function (error) {

        console.error(
            'இன்றைய இலக்கியம் கருவியை ஏற்றுவதில் பிழை:',
            error
        );

    });

}());
