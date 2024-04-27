import EC from 'eight-colors';
import Util from '../../../utils/util';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const getContributions = async (targetName) => {

    const variables = {
        login: targetName
    };

    const headers = {
        Authorization: `token ${GITHUB_TOKEN}`
    };

    // fetch only owner repos & not forks
    const data = {
        query: `
          query userInfo($login: String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }      
        `,
        variables
    };

    const url = 'https://api.github.com/graphql';

    const [err, res] = await Util.request({
        url,
        method: 'post',
        headers,
        data
    });

    if (err) {
        EC.logRed(`failed to load contributions: ${targetName}`);
        EC.logRed(err.message);
        // console.log(err.stack);
        const ed = Util.getValue(err, 'response.data');
        if (ed) {
            console.log(ed);
        }
        return;
    }

    const calendar = Util.getValue(res, 'data.data.user.contributionsCollection.contributionCalendar');
    if (!calendar) {
        return;
    }

    const total = calendar.totalContributions;
    const weeks = calendar.weeks;

    const dates = [];
    const contributions = [];
    weeks.forEach((week) => {
        week.contributionDays.forEach((day) => {
            dates.push(day.date);
            contributions.push(day.contributionCount);
        });
    });

    // console.log(contributions);

    const contributionsData = {
        name: targetName,
        total,
        dates,
        contributions
    };

    return contributionsData;
};

const getTicksData = (dates, sw, ay, ch, padding, ppi, even, bg) => {
    // month list
    const ms = [];
    // grid list
    const gs = [];
    // d list
    const ds = [];
    ds.push(`M${Util.pixFixed(padding)},${ay + 1}v5`);

    // for month 01 ticks, 1 spaces
    const start = 1;
    const end = dates.length - start;
    dates.forEach((item, i) => {
        if (i > start && i < end) {
            if (item.endsWith('-01')) {
                const ix = Util.pixFixed(padding + i * ppi);
                ds.push(`M${ix},${ay + 1}v3`);
                gs.push(ix);
                ms.push(parseInt(item.slice(5, 7)));
            }
        }
    });

    const txEnd = Util.pixFixed(sw - padding - 1);

    ds.push(`M${txEnd},${ay + 1}v5`);
    const ticksD = ds.join(' ');

    const rects = [];
    const texts = [];

    const gy = ay - ch;
    gs.map((tx1, i) => {
        if (i % 2 === 0) {
            const tx2 = gs[i + 1] || txEnd;
            const gw = tx2 - tx1;
            if (gw > 0) {
                rects.push(`<rect x="${tx1}" y="${gy}" width="${gw}" height="${ch}" fill="${even}" />`);
                if (ch > 50 && gw > 35) {
                    texts.push(`<text x="${tx1 + gw / 2}" y="${gy + 30}" fill="${bg}">${ms[i]}</text>`);
                }
            }
        }
    }).filter((it) => it);


    let grid = rects.join('');
    if (texts.length) {
        grid += `<g text-anchor="middle" font-size="30">${texts.join('')}</g>`;
    }

    return {
        grid,
        ticksD
    };
};

const getPoints = (contributions, maxCount, maxValue, length, cw, ch, cy, padding) => {
    let maxPoint;
    const ds = contributions.map((item, i) => {
        const x = Util.dFixed(i / length * cw + padding);
        const y = Util.dFixed(ch - item / maxValue * ch + cy);

        if (item === maxCount || !maxPoint) {
            maxPoint = {
                x, y, i
            };
        }

        return `${x},${y}`;
    });

    // console.log(maxPoint);
    // fix maxPoint position
    maxPoint.y += 4;
    if (maxPoint.i > length / 2) {
        maxPoint.anchor = 'end';
        maxPoint.text = `${maxCount}- `;
    } else {
        maxPoint.anchor = 'start';
        maxPoint.text = ` -${maxCount}`;
    }

    let maxTip = '';
    if (maxCount) {
        const list = [];
        list.push('<g opacity="0">');
        list.push(`<text x="${maxPoint.x}" y="${maxPoint.y}" text-anchor="${maxPoint.anchor}">${maxPoint.text}</text>`);
        list.push('<animate attributeName="opacity" values="1" begin="1s" />');
        list.push('</g>');
        maxTip = list.join('');
    }

    return {
        ds,
        maxTip
    };

};

const getSvg = (targetName, data, options) => {

    if (!data) {
        return Util.getInvalidSvg();
    }

    const { dates, contributions } = data;
    const length = dates.length;

    const color = options.color;
    const axis = options.axis;
    const bg = options.bg;

    // svg width
    const sw = Math.abs(Util.toNum(options.width, true));
    const padding = 15;

    const label = Util.replace(options.label, {
        total: data.total.toLocaleString(),
        name: targetName
    });

    // chart
    const cy = 40;
    const cw = sw - 2 * padding;
    const ppi = cw / length;

    const maxCount = Math.max.apply(null, contributions);

    const maxValue = Math.max(maxCount, 1);
    const ch = Util.clamp(Math.ceil(maxCount * ppi * 2), 30, 100);
    // console.log('max', max, 'ch', ch);

    const { ds, maxTip } = getPoints(contributions, maxCount, maxValue, length, cw, ch, cy, padding);

    const dStroke = `M${ds.join('L')}`;
    const dFill = `M${padding},${ch + cy}L${ds.join('L')}V${ch + cy}`;

    // axis
    const ay = cy + ch;

    // ticks
    const tickHeight = 16;
    const ty = ay + tickHeight;

    const { grid, ticksD } = getTicksData(dates, sw, ay, ch, padding, ppi, options.even, bg);

    const firstLabel = dates[0];
    const lastLabel = dates[length - 1];

    // svg height
    const sh = ay + tickHeight + padding;

    const list = [];
    list.push(`<svg width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}" xmlns="http://www.w3.org/2000/svg">`);
    list.push(`<title>${label}</title>`);

    list.push('<defs>');

    list.push(`<clipPath id="am"><rect x="${padding}" y="${cy}" width="${cw}" height="${ch}" fill="#fff">`);
    list.push(`<animate attributeName="width" from="0" to="${cw}" dur="1s" />`);
    list.push('</rect></clipPath>');

    list.push('</defs>');

    // border and bg
    list.push(`<rect x="0.5" y="0.5" width="${sw - 1}" height="${sh - 1}" stroke="#ddd" rx="8" fill="${bg}" />`);

    // bgs
    list.push(grid);

    // axis
    list.push(`<rect x="${padding}" y="${ay}" width="${cw}" height="1" fill="${axis}" />`);

    // ticks
    list.push(`<path d="${ticksD}" stroke="${axis}" />`);

    // chart
    list.push('<g clip-path="url(#am)">');
    list.push(`<path d="${dFill}" fill="${color}" fill-opacity="0.2" />`);
    list.push(`<path d="${dStroke}" stroke="${color}" stroke-width="1.5" stroke-linecap="butt" stroke-linejoin="round" fill="none" />`);
    list.push('</g>');

    list.push(`<g font-size="11" font-family="${Util.font}" text-anchor="start">`);
    // title
    list.push(`<text x="${padding}" y="30" font-size="16">${label}</text>`);

    list.push(`<text x="${padding}" y="${ty}">${firstLabel}</text>`);
    list.push(`<text x="${sw - padding}" y="${ty}" text-anchor="end">${lastLabel}</text>`);
    list.push(maxTip);

    list.push('</g>');

    list.push('</svg>');

    return list.join('');
};

const getOptions = (searchParams) => {

    const options = {
        width: 600,
        color: '#44cc11',
        even: '#f6f8fa',
        axis: '#999999',
        bg: '#ffffff',
        label: '{name} - {total} contributions past year',
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

    const targetName = list.shift();

    const data = await getContributions(targetName);
    // console.log(data);
    const options = getOptions(searchParams);

    if (options.output === 'json') {
        const json = data || {};
        json.options = options;
        const content = JSON.stringify(json);
        return new Response(content, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const svg = getSvg(targetName, data, options);

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml'
        }
    });
}
