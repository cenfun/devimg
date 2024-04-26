import EC from 'eight-colors';
import Util from '../../../utils/util';

const getDownloads = async (targetName) => {

    // https://github.com/npm/registry/blob/master/docs/download-counts.md
    // if shared request could be better
    const url = `https://api.npmjs.org/downloads/range/last-month/${targetName}`;
    // console.log(`request ${url}

    // code will be 304? stop redirect
    // const maxRedirects = 0;

    const [err, res] = await Util.request({
        url
    });

    if (err) {
        EC.logRed(`failed to load from: ${url}`);
        EC.logRed(err.message);
        // console.log(err.stack);
        return;
    }

    const data = res.data;
    if (!data || !data.downloads) {
        return;
    }

    let total = 0;
    const dates = [];
    const downloads = [];

    data.downloads.forEach((item) => {
        total += item.downloads;
        dates.push(item.day);
        downloads.push(item.downloads);
    });

    const downloadsData = {
        targetName,
        total,
        dates,
        downloads
    };

    return downloadsData;
};

const getLine = (dStroke, dFill, color, scale) => {
    const list = [];
    list.push('<g clip-path="url(#am)">');
    list.push(`<path d="${dFill}" fill="${color}" fill-opacity="0.2" />`);
    list.push(`<path d="${dStroke}" stroke="${color}" stroke-width="${1.5 * scale}" stroke-linecap="butt" stroke-linejoin="round" fill="none" />`);
    list.push('</g>');
    return list.join('');
};

const getLineMask = (cw, vh) => {
    const list = [];
    list.push(`<clipPath id="am"><rect width="${cw}" height="${vh}" fill="#fff">`);
    list.push(`<animate attributeName="width" from="0" to="${cw}" dur="1s" />`);
    list.push('</rect></clipPath>');
    return list.join('');
};

// eslint-disable-next-line max-statements
const getSvg = (targetName, data, options) => {

    // svg height
    const sh = Math.abs(Util.toNum(options.height, true));
    const radius = options.radius;
    const color = options.color;
    const bg = data ? options.bg : '#aaa';

    const scale = 10;
    const vh = sh * scale;

    let total = 0;
    let label = 'invalid';
    let lineMask = '';
    let line = '';
    let cw = 0;

    if (data) {

        // chart
        cw = vh * 4.5;

        total = data.total;
        const totalStr = Util.KNF(total);

        // console.log(totalStr, total);

        label = Util.replace(options.label, {
            total: totalStr
        });

        // data max
        const { downloads } = data;
        const ds = downloads.map((item) => {
            return item || 1;
        });
        const maxValue = Math.max(Math.max.apply(null, ds) * 1.1, sh);

        const d = ds.map((item, i) => {
            const x = Util.dFixed(i / 29 * cw);
            const y = Util.dFixed(vh - item / maxValue * vh);
            return `${x},${y}`;
        });

        const dStroke = `M${d.join('L')}`;
        const dFill = `M0,${vh}L${d.join('L')}V${vh}`;

        lineMask = getLineMask(cw, vh);
        line = getLine(dStroke, dFill, color, scale);

    }

    // console.log(stroke, fill);
    const textPadding = Util.getFontWidth(2, scale);
    // text width
    let tl = 0;
    let tw = 0;
    if (label) {
        tl = Util.getFontWidth(label.length, scale);
        tw = tl + textPadding;
    }
    const tx = cw + tw * 0.5;
    const ty = vh * 0.5 + 4 * scale;

    // view width
    const vw = Math.ceil(cw + tw);

    // svg width
    const sw = Math.ceil(vw / scale);

    const list = [];
    list.push(`<svg width="${sw}" height="${sh}" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`);
    list.push(`<title>${targetName}: ${total} downloads</title>`);

    list.push('<defs>');

    list.push(`<text id="dt" x="${tx}" y="${ty}" font-size="${11 * scale}" font-family="${Util.font}" textLength="${tl}" text-anchor="middle">${label}</text>`);

    list.push('<linearGradient id="lg" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>');

    list.push(`<clipPath id="cp"><rect width="${vw}" height="${vh}" ry="${radius}" fill="#fff"/></clipPath>`);

    list.push(lineMask);

    list.push('</defs>');


    list.push('<g clip-path="url(#cp)">');

    list.push(line);

    list.push(`<rect x="${cw}" width="${tw}" height="${vh}" fill="${bg}"/>`);

    // linearGradient
    list.push(`<rect width="${vw}" height="${vh}" fill="url(#lg)"/>`);

    // text
    list.push('<use xlink:href="#dt" fill="#000" transform="translate(0, 10)" opacity="0.3" />');
    list.push('<use xlink:href="#dt" fill="#fff" />');

    list.push('</g>');
    list.push('</svg>');

    return list.join('');
};

const getOptions = (searchParams) => {
    const options = {
        height: 20,
        radius: '15%',
        color: '#44cc11',
        bg: '#007ec6',
        label: '{total}/month',
        output: 'svg'
    };

    Object.keys(options).forEach((k) => {
        if (searchParams.has(k)) {
            options[k] = searchParams.get(k);
        }
    });

    return options;

};

export async function GET(request) {
    const { pathname, searchParams } = new URL(request.url);

    const list = pathname.split('/').slice(3);
    if (list.length > 2) {
        list.length = 2;
    }
    if (list.length > 1) {
        if (!list[0].startsWith('@')) {
            list.length = 1;
        }
    }
    const targetName = list.join('/');

    const data = await getDownloads(targetName);
    // console.log(data);
    const options = getOptions(searchParams);

    const svg = getSvg(targetName, data, options);

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml'
        }
    });
}
