import EC from 'eight-colors';
import Util from '../../../utils/util';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const avatarCache = new Map();
let time_clean = Date.now();

// cache time: 2 hours
const cacheTime = 2 * 60 * 60 * 1000;
// clean time: 60 seconds
const cleanTime = 60 * 1000;

const avatarSize = 48;

const getAvatarImage = async (targetName, avatarUrl) => {

    const time = Date.now();
    if (time - time_clean > cleanTime) {
        time_clean = time;
        avatarCache.forEach((item, key) => {
            // console.log(item);
            if (time - item.time > cacheTime) {
                avatarCache.delete(key);
            }
        });
    }

    if (avatarCache.has(targetName)) {
        return avatarCache.get(targetName).data;
    }

    console.log(`load avatar: ${avatarUrl} ...`);
    const [err, res] = await Util.request({
        url: avatarUrl,
        method: 'get',
        responseType: 'arraybuffer'
    });

    if (err) {
        console.log(`failed to load avatar: ${avatarUrl}`);
        return '';
    }

    const contentType = res.headers['content-type'] || 'image';
    const base64 = Buffer.from(res.data, 'binary').toString('base64');
    console.log(`loaded avatar: ${avatarUrl} (${Date.now() - time} ms)`);

    const data = `data:${contentType};base64,${base64}`;
    avatarCache.set(targetName, {
        time,
        data
    });

    return data;
};

const getProfile = async (targetName) => {

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
              name
              avatarUrl(size: 48)
              bio
              createdAt
              issues {
                totalCount
              }
              pullRequests {
                totalCount
              }
              followers {
                totalCount
              }
              following {
                totalCount
              }
              sponsors {
                totalCount
              }
              sponsoring {
                totalCount
              }
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                }
              }
              repositories(ownerAffiliations: OWNER, isFork: false, first: 100, orderBy: {direction: DESC, field: STARGAZERS}) {
                totalCount
                nodes {
                  stargazers {
                    totalCount
                  }
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
        EC.logRed(`failed to load profile: ${targetName}`);
        EC.logRed(err.message);
        // console.log(err.stack);
        const ed = Util.getValue(err, 'response.data');
        if (ed) {
            console.log(ed);
        }
        return;
    }

    const profileData = Util.getValue(res, 'data.data.user');
    if (profileData) {
        profileData.avatarImage = await getAvatarImage(targetName, profileData.avatarUrl);
    }
    return profileData;
};

const updateLayout = (items, padding, sw, sh) => {

    const space = 10;
    const rowHeight = 16;
    const iconSize = 16;

    items.forEach((item) => {
        const len = (`${item.label} ${item.value}`).length;
        item.minWidth = Util.getFontWidth(len, 1.1) + space + iconSize + 5;
    });

    const maxWidth = Math.max.apply(null, items.map((it) => it.minWidth));
    const maxCols = Math.max(Math.floor((sw - padding * 2) / (maxWidth + space)), 1);
    // console.log(sw, maxWidth, maxCols);

    const totalSpace = sw - padding * 2 - maxCols * maxWidth;
    const realSpace = maxCols > 1 ? Math.floor(totalSpace / (maxCols - 1)) : 0;

    let rowIndex;
    let colIndex;
    items.forEach((item, i) => {
        rowIndex = Math.floor(i / maxCols);
        colIndex = i % maxCols;

        // console.log(rowIndex, colIndex);
        item.left = iconSize + 5;
        item.right = maxWidth;

        item.x = padding + colIndex * (maxWidth + realSpace);
        item.y = sh + space + rowIndex * (rowHeight + space);

    });

    sh += (rowIndex + 1) * (rowHeight + space);

    return sh;
};

const getTopLanguages = (languages) => {
    const list = [];
    let per = 0;
    for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        per += lang.percent;
        list.push(lang.name);
        if (i >= 1 || per > 0.8) {
            break;
        }
    }

    return `${list.join('/')} ${Math.round(per * 100)}%`;
};

const getSvg = (targetName, data, options) => {
    if (!data) {
        return Util.getInvalidSvg();
    }

    const bg = Util.normalizeColor(options.bg);

    // svg width
    const sw = Math.abs(Util.toNum(options.width, true));
    const padding = 15;
    let sh = padding;

    let label = Util.replace(options.label, {
        bio: data.bio || targetName,
        name: data.name || targetName
    });
    label = Util.xmlEscape(label);

    const joined = `Joined GitHub ${Util.ago(data.createdAt)}`;
    const titleLeft = padding * 2 + avatarSize;
    const titleY = padding + avatarSize / 2;

    sh += avatarSize;

    let totalStars = 0;
    data.repositories.nodes.forEach((node) => {
        totalStars += node.stargazers.totalCount;
    });

    const languages = Util.getLanguages(data.repositories.nodes);
    const topLanguages = getTopLanguages(languages);

    const items = [{
        label: 'Total Repositories',
        value: Util.NF(data.repositories.totalCount),
        icon: ['M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z']
    }, {
        label: 'Total Pull Requests',
        value: Util.NF(data.pullRequests.totalCount),
        icon: ['M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z']
    }, {
        label: 'Total Stars',
        value: Util.KNF(totalStars),
        icon: ['M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z']
    }, {
        label: 'Total Issues',
        value: Util.NF(data.issues.totalCount),
        icon: [
            'M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
            'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z'
        ]
    }, {
        label: 'Contributions Past Year',
        value: Util.NF(data.contributionsCollection.contributionCalendar.totalContributions),
        icon: ['M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z']
    }, {
        label: 'Languages',
        value: topLanguages,
        icon: ['M4.708 5.578 2.061 8.224l2.647 2.646-.708.708-3-3V7.87l3-3zm7-.708L11 5.578l2.647 2.646L11 10.87l.708.708 3-3V7.87zM4.908 13l.894.448 5-10L9.908 3z']
    }, {
        label: 'Followers / Following',
        value: `${Util.KNF(data.followers.totalCount)} / ${Util.KNF(data.following.totalCount)}`,
        icon: ['M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z']
    }, {
        label: 'Sponsors / Sponsoring',
        value: `${Util.KNF(data.sponsors.totalCount)} / ${Util.KNF(data.sponsoring.totalCount)}`,
        icon: ['m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z']
    }];

    sh = updateLayout(items, padding, sw, sh);

    sh += padding;

    // console.log(items);

    const list = [];
    list.push(`<svg width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}" xmlns="http://www.w3.org/2000/svg">`);
    list.push(`<title>${label}</title>`);

    list.push('<defs>');
    // clip path avatar
    list.push(`<clipPath id="cpa"><rect x="${padding}" y="${padding}" width="${avatarSize}" height="${avatarSize}" rx="${avatarSize}" fill="#fff"/></clipPath>`);

    list.push('</defs>');

    // border and bg
    list.push(`<rect x="0.5" y="0.5" width="${sw - 1}" height="${sh - 1}" stroke="#ddd" rx="8" fill="${bg}" />`);

    // avatar
    list.push('<g clip-path="url(#cpa)">');
    list.push(`<image x="${padding}" y="${padding}" href="${data.avatarImage}" width="${avatarSize}" height="${avatarSize}" />`);
    list.push('</g>');

    // title
    list.push('<g text-anchor="start">');
    list.push(`<text x="${titleLeft}" y="${titleY - 4}" font-size="16" dominant-baseline="auto">${label}</text>`);
    list.push(`<text x="${titleLeft}" y="${titleY + 4}" font-size="14" dominant-baseline="hanging">${joined}</text>`);
    list.push('</g>');

    items.forEach((item) => {
        list.push(`<g transform="translate(${item.x},${item.y})" font-size="14" dominant-baseline="hanging">`);

        list.push('<svg viewBox="0 0 16 16" width="16" height="16">');
        item.icon.forEach((d) => {
            list.push(`<path d="${d}"></path>`);
        });
        list.push('</svg>');

        list.push(`<text x="${item.left}" y="2" text-anchor="start">${item.label}</text>`);
        list.push(`<text x="${item.right}" y="2" text-anchor="end">${item.value}</text>`);
        list.push('</g>');
    });


    list.push('</svg>');

    return list.join('');

};

const getOptions = (searchParams) => {

    const options = {
        width: 600,
        bg: 'ffffff',
        label: '{name} - {bio}',
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

    const data = await getProfile(targetName);
    // console.log(data);

    const options = getOptions(searchParams);

    if (options.output === 'json') {
        return Util.responseJson(data, options);
    }

    const svg = getSvg(targetName, data, options);
    return Util.responseSvg(svg);
}
