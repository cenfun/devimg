'use client';

import { useState, useEffect } from 'react';
import './github-markdown.css';

const useDebounce = (cb, delay = 500) => {
    const [debounceValue, setDebounceValue] = useState(cb);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValue(cb);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [cb, delay]);
    return debounceValue;
};

const selectAll = (e) => {
    e.target.select();
};

export default function Home() {

    const labelDownloads = '{total}/month';
    const labelContributions = '{name} - {total} contributions past year';
    const labelLanguages = '{name} - {total} used languages';

    // =========================================================================

    const npmDownloads = [{
        name: 'lz-utils',
        options: 'label={total} downloads'
    }, {
        name: 'vue',
        options: 'label=&height=30&radius=0'
    }, {
        name: '@koa/router',
        options: ''
    }, {
        name: 'console-grid',
        options: 'color=ff0000&bg=green'
    }];

    const [downloadsName, setDownloadsName] = useState('');
    const [downloadsOptions, setDownloadsOptions] = useState('');
    const [downloadsLink, setDownloadsLink] = useState('');

    const downloadsNameValue = useDebounce(downloadsName);
    const downloadsOptionsValue = useDebounce(downloadsOptions);

    useEffect(() => {
        let link = '';
        if (downloadsNameValue) {
            link = `/npm/downloads/${downloadsNameValue}`;
            if (downloadsOptionsValue) {
                link += `?${downloadsOptionsValue}`;
            }
        }
        setDownloadsLink(link);
    }, [downloadsNameValue, downloadsOptionsValue]);

    const downloadsNameChange = (e) => {
        setDownloadsName(e.target.value);
    };
    const downloadsOptionsChange = (e) => {
        setDownloadsOptions(e.target.value);
    };

    const getDownloadsLink = (it) => {
        const p = `/npm/downloads/${it.name}`;
        if (it.options) {
            return `${p}?${it.options}`;
        }
        return p;
    };

    // =========================================================================

    const githubContributions = [{
        name: 'cenfun',
        link: '/github/contributions/cenfun'
    }];

    const [contributionsName, setContributionsName] = useState('');
    const [contributionsOptions, setContributionsOptions] = useState('');
    const [contributionsLink, setContributionsLink] = useState('');

    const contributionsNameValue = useDebounce(contributionsName);
    const contributionsOptionsValue = useDebounce(contributionsOptions);

    useEffect(() => {
        let link = '';
        if (contributionsNameValue) {
            link = `/github/contributions/${contributionsNameValue}`;
            if (contributionsOptionsValue) {
                link += `?${contributionsOptionsValue}`;
            }
        }
        setContributionsLink(link);
    }, [contributionsNameValue, contributionsOptionsValue]);

    const contributionsNameChange = (e) => {
        setContributionsName(e.target.value);
    };
    const contributionsOptionsChange = (e) => {
        setContributionsOptions(e.target.value);
    };

    // =========================================================================

    const githubLanguages = [{
        name: 'cenfun',
        link: '/github/languages/cenfun'
    }];

    const [languagesName, setLanguagesName] = useState('');
    const [languagesOptions, setLanguagesOptions] = useState('');
    const [languagesLink, setLanguagesLink] = useState('');

    const languagesNameValue = useDebounce(languagesName);
    const languagesOptionsValue = useDebounce(languagesOptions);

    useEffect(() => {
        let link = '';
        if (languagesNameValue) {
            link = `/github/languages/${languagesNameValue}`;
            if (languagesOptionsValue) {
                link += `?${languagesOptionsValue}`;
            }
        }
        setLanguagesLink(link);
    }, [languagesNameValue, languagesOptionsValue]);

    const languagesNameChange = (e) => {
        setLanguagesName(e.target.value);
    };
    const languagesOptionsChange = (e) => {
        setLanguagesOptions(e.target.value);
    };

    // =========================================================================

    const relatedProjects = [
        'https://github.com/badges/shields',
        'https://github.com/badgen/badgen.net',
        'https://github.com/anuraghazra/github-readme-stats',
        'https://github.com/denvercoder1/github-readme-streak-stats',
        'https://github.com/vn7n24fzkq/github-profile-summary-cards'
    ];

    return (
        <div className="markdown-body">
            <h1>
                <div className="inline">
                    <div className="title">DevImg</div>
                    <a href="https://github.com/cenfun/devimg" target="_blank" className="github">
                        <svg viewBox="0 0 16 16" width="30" height="30" pointer-events="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>
                    </a>
                </div>


            </h1>
            <p>Generating npm or github status for profile README.</p>
            <ul>
                <li><a href="#npm-downloads">npm downloads</a></li>
                <li><a href="#github-contributions">github contributions</a></li>
                <li><a href="#github-languages">github languages</a></li>
            </ul>

            <a name="npm-downloads"></a>
            <div className="header">npm downloads</div>

            <details>
                <summary>endpoint</summary>
                <code>https://devimg.vercel.app/npm/downloads/:ns?/:name</code>
            </details>

            <details>
                <summary>options</summary>
                <ul>
                    <li>height=20</li>
                    <li>radius=15</li>
                    <li>color=44cc11</li>
                    <li>bg=007ec6</li>
                    <li>label={labelDownloads}</li>
                    <li>output=svg or json</li>
                </ul>
            </details>

            <details open>
                <summary>examples</summary>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Options</th>
                            <th>Downloads</th>
                            <th>Markdown</th>
                        </tr>
                    </thead>
                    <tbody>
                        {npmDownloads.map((it) => {
                            return (
                                <tr key={it.name}>
                                    <td>{it.name}</td>
                                    <td>{ it.options && <code>{it.options}</code>}</td>
                                    <td><img src={getDownloadsLink(it)} alt={it.name} /></td>
                                    <td><code>![](https://devimg.vercel.app{getDownloadsLink(it)})</code></td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td><input placeholder="Enter npm name" type="text" value={downloadsName} onChange={downloadsNameChange} onFocus={selectAll}></input></td>
                            <td><input placeholder="Enter options" type="text" value={downloadsOptions} onChange={downloadsOptionsChange} onFocus={selectAll}></input></td>
                            <td>{downloadsLink && <img src={downloadsLink} alt={downloadsName} />}</td>
                            <td>{downloadsLink && <code>![](https://devimg.vercel.app{downloadsLink})</code> }</td>
                        </tr>
                    </tbody>
                </table>
            </details>

            <a name="github-contributions"></a>
            <div className="header">github contributions</div>

            <details>
                <summary>endpoint</summary>
                <code>https://devimg.vercel.app/github/contributions/:name</code>
            </details>

            <details>
                <summary>options</summary>
                <ul>
                    <li>width=600</li>
                    <li>color=44cc11</li>
                    <li>even=f6f8fa</li>
                    <li>axis=99999</li>
                    <li>bg=ffffff</li>
                    <li>label={labelContributions}</li>
                    <li>output=svg or json</li>
                </ul>
            </details>

            <details open>
                <summary>examples</summary>
                {githubContributions.map((it) => {
                    return (
                        <p className="inline" key={it.name}>
                            <img src={it.link} alt={it.name} />
                            <code>![](https://devimg.vercel.app{it.link})</code>
                        </p>
                    );
                })}
                <p className="inline">
                    <input placeholder="Enter github name" type="text" value={contributionsName} onChange={contributionsNameChange} onFocus={selectAll}></input>
                    <input placeholder="Enter options" type="text" value={contributionsOptions} onChange={contributionsOptionsChange} onFocus={selectAll}></input>
                </p>
                <p className="inline" >
                    { contributionsLink && <img src={contributionsLink} alt={contributionsName} />}
                    { contributionsLink && <code>![](https://devimg.vercel.app{contributionsLink})</code>}
                </p>
            </details>

            <a name="github-languages"></a>
            <div className="header">github languages</div>

            <details>
                <summary>endpoint</summary>
                <code>https://devimg.vercel.app/github/languages/:name</code>
            </details>

            <details>
                <summary>options</summary>
                <ul>
                    <li>width=600</li>
                    <li>limit=20</li>
                    <li>colors=dodgerblue,green,orangered...</li>
                    <li>bg=ffffff</li>
                    <li>label={labelLanguages}</li>
                    <li>output=svg or json</li>
                </ul>
            </details>

            <details open>
                <summary>examples</summary>
                {githubLanguages.map((it) => {
                    return (
                        <p className="inline" key={it.name}>
                            <img src={it.link} alt={it.name} />
                            <code>![](https://devimg.vercel.app{it.link})</code>
                        </p>
                    );
                })}
                <p className="inline">
                    <input placeholder="Enter github name" type="text" value={languagesName} onChange={languagesNameChange} onFocus={selectAll}></input>
                    <input placeholder="Enter options" type="text" value={languagesOptions} onChange={languagesOptionsChange} onFocus={selectAll}></input>
                </p>
                <p className="inline" >
                    { languagesLink && <img src={languagesLink} alt={languagesName} />}
                    { languagesLink && <code>![](https://devimg.vercel.app{languagesLink})</code>}
                </p>
            </details>

            <div className="header">related projects</div>
            <ul open>
                {relatedProjects.map((it, i) => {
                    return (
                        <li key={i}><a href={it} target="_blank">{it}</a></li>
                    );
                })}

            </ul>

            <div className="footer"></div>
        </div>
    );
}
