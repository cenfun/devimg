'use client';

import { useState, useEffect } from 'react';

import { useDebounce, selectAll } from '../../utils/use';

export default function Home() {

    const labelLanguages = '{name} - {total} used languages';

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

    return (
        <div className="usage-github-languages">

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

        </div>
    );
}
