import EC from 'eight-colors';
import Util from '../../../utils/util';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const getLanguages = async (targetName) => {

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
              repositories(ownerAffiliations: OWNER, isFork: false, first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
                nodes {
                  languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                    edges {
                      size
                      node {
                        name
                      }
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
        EC.logRed(`failed to load languages: ${targetName}`);
        EC.logRed(err.message);
        // console.log(err.stack);
        const ed = Util.getValue(err, 'response.data');
        if (ed) {
            console.log(ed);
        }
        return;
    }

    const nodes = Util.getValue(res, 'data.data.user.repositories.nodes');
    if (!nodes) {
        return;
    }

    const map = new Map();
    nodes.forEach((repo) => {
        const edges = Util.getValue(repo, 'languages.edges');
        if (edges) {
            edges.forEach((item) => {
                const name = item.node.name;
                const size = item.size;
                const lang = map.get(name);
                if (lang) {
                    map.set(name, lang + size);
                } else {
                    map.set(name, size);
                }
            });
        }
    });

    let total = 0;
    const languages = [];
    map.forEach((v, k) => {
        languages.push({
            size: v,
            name: k
        });
        total += v;
    });

    // clear for GC
    map.clear();

    languages.sort((a, b) => {
        return b.size - a.size;
    });

    languages.forEach((item) => {
        item.percent = item.size / total;
    });

    const languagesData = {
        name: targetName,
        languages
    };


    return languagesData;
};

const columnSpaceHandler = (columns, width) => {
    const count = columns.length;
    if (count > 1) {
        const tw = columns.reduce((n, item) => n + item.width, 0);
        const space = Math.floor((width - tw) / (count - 1));
        columns.forEach((it, i) => {
            it.width += space;
        });
    }
};


const legendSpaceHandler = (columns, rows) => {
    rows.forEach((row) => {
        row.forEach((cell, i) => {
            const maxL = columns[i].length;
            if (cell.ll < maxL) {
                const spaceL = maxL - cell.ll;
                cell.legend = cell.name + ''.padStart(spaceL) + cell.percentStr;
            }
        });

    });
};


const getLayout = (o) => {

    const {
        languages, width, space, count
    } = o;

    if (!languages.length) {
        return {
            columns: [],
            rows: []
        };
    }

    const currentRows = [];

    let i = 0;
    let row;
    languages.forEach((item) => {
        if (i < count) {
            if (!row) {
                row = [];
                currentRows.push(row);
            }
            row.push(item);
            i += 1;
        } else {
            row = [item];
            currentRows.push(row);
            i = 1;
        }
    });

    const currentColumns = [];
    let maxWidth = 0;

    const rowColumns = currentRows[0];
    const lastColumnIndex = rowColumns.length - 1;

    rowColumns.forEach((fc, columnIndex) => {
        const lws = currentRows.map((rowItem) => {
            const cell = rowItem[columnIndex];
            if (cell) {
                return cell.lw;
            }
            return 0;
        });
        let maxW = Math.max.apply(null, lws);
        if (columnIndex !== lastColumnIndex) {
            maxW += space;
        }

        const lls = currentRows.map((rowItem) => {
            const cell = rowItem[columnIndex];
            if (cell) {
                return cell.ll;
            }
            return 0;
        });
        const maxL = Math.max.apply(null, lls);
        currentColumns.push({
            width: maxW,
            length: maxL
        });
        maxWidth += maxW;
    });

    if (maxWidth < width) {

        if (currentRows.length > 1) {
            o.count += 1;
            o.prevRows = currentRows;
            o.prevColumns = currentColumns;
            return getLayout(o);
        }

        columnSpaceHandler(currentColumns, width);
        legendSpaceHandler(currentColumns, currentRows);

        return {
            columns: currentColumns,
            rows: currentRows
        };

    }

    const columns = o.prevColumns || currentColumns;
    columnSpaceHandler(columns, width);

    const rows = o.prevRows || currentRows;
    legendSpaceHandler(columns, rows);

    return {
        columns,
        rows
    };

};

const getSvg = (targetName, data, options) => {
    if (!data) {
        return Util.getInvalidSvg();
    }
    const languages = data.languages;

    const bg = options.bg;
    const colors = options.colors.split(',');

    const limit = Math.abs(Util.toNum(options.limit, true));
    if (languages.length > limit) {
        languages.length = limit;
    }

    // svg width
    const sw = Math.abs(Util.toNum(options.width, true));
    const padding = 15;

    const label = Util.replace(options.label, {
        total: languages.length,
        name: targetName
    });

    // bar
    const bw = sw - 2 * padding;
    const bh = 12;
    const by = 40;

    const ps = [];
    let bx = padding;
    languages.forEach((lang, i) => {
        const p = lang.percent;
        ps.push(p);
        const per = (p * 100).toFixed(2);
        lang.percentStr = ` (${per}%)`;
        lang.legend = lang.name + lang.percentStr;
        lang.color = colors[i % colors.length];
        lang.bx = `${bx.toFixed(1)}`;
        const w = p * bw;
        lang.bw = w.toFixed(1);
        bx += w;
    });

    // max percent / min opacity
    const maxP = Math.max.apply(null, ps);
    const minO = 0.6;

    // opacity
    languages.forEach((lang, i) => {
        const opacity = minO + (1 - minO) * (lang.percent / maxP);
        lang.opacity = opacity.toFixed(2);
        // lang.opacity = 1;
    });

    // legend
    const iconSize = 10;
    const space = 5;
    languages.forEach((lang) => {
        lang.ll = lang.legend.length;
        // icon width = 10 + 5 = padding
        lang.lw = Util.getFontWidth(lang.ll) + iconSize + space;
    });

    // layout
    const { columns, rows } = getLayout({
        languages,
        width: bw,
        space,
        count: 1
    });

    // get column text length
    columns.forEach((c) => {
        c.tl = Util.getFontWidth(c.length);
    });
    // console.log('columns fixed', columns);

    const lh = 20;
    let ly = by + bh + 10;
    rows.forEach((row) => {
        let lx = padding;
        row.forEach((cell, i) => {
            const column = columns[i];
            cell.lx = lx;
            cell.ly = ly;
            cell.tl = column.tl;
            lx += column.width;
        });
        ly += lh;
    });

    const sh = ly + 5;

    const list = [];
    list.push(`<svg width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}" xmlns="http://www.w3.org/2000/svg">`);
    list.push(`<title>${label}</title>`);

    list.push('<defs>');
    // clip path bar
    list.push(`<clipPath id="cpb"><rect x="${padding}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="#fff"/></clipPath>`);

    list.push('</defs>');

    // border and bg
    list.push(`<rect x="0.5" y="0.5" width="${sw - 1}" height="${sh - 1}" stroke="#ddd" rx="8" fill="${bg}" />`);

    // title
    list.push(`<text x="${padding}" y="30" font-size="16" font-family="${Util.font}" text-anchor="start">${label}</text>`);

    // bar
    list.push('<g clip-path="url(#cpb)">');
    languages.forEach((lang) => {
        list.push(`<rect opacity="${lang.opacity}" x="${lang.bx}" y="${by}" width="${lang.bw}" height="${bh}" fill="${lang.color}" />`);
    });
    list.push('</g>');

    // legend
    list.push(`<g font-size="11" font-family="${Util.font}" text-anchor="start">`);
    languages.forEach((lang) => {
        list.push(`<rect opacity="${lang.opacity}" x="${lang.lx}" y="${lang.ly}" width="${iconSize}" height="${iconSize}" fill="${lang.color}" />`);
        list.push(`<text opacity="${lang.opacity}" x="${lang.lx + padding}" y="${lang.ly + 9}" textLength="${lang.tl}" style="white-space:pre;">${lang.legend}</text>`);
    });
    list.push('</g>');

    list.push('</svg>');

    return list.join('');
};

const getOptions = (searchParams) => {

    const defaultColors = [
        'dodgerblue',
        'green',
        'orangered',
        'purple',
        'orange',

        'gray',

        'cadetblue',
        'lime',
        'olive',
        'pink',
        'cyan'
    ];

    const options = {
        width: 600,
        limit: 20,
        colors: defaultColors.join(','),
        bg: '#ffffff',
        label: '{name} - {total} used languages',
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

    const data = await getLanguages(targetName);
    // console.log(data);
    const options = getOptions(searchParams);

    const svg = getSvg(targetName, data, options);

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml'
        }
    });
}
