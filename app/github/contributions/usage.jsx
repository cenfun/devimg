'use client';

import { useState, useEffect } from 'react';
import { useDebounce, selectAll } from '../../utils/use';

export default function Home() {

    const labelContributions = '{name} - {total} contributions past year';

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

    return (
        <div className="usage-github-contributions">

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

        </div>
    );
}
