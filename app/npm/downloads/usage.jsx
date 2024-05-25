'use client';

import { useState, useEffect } from 'react';

import { useDebounce, selectAll } from '../../utils/use';

export default function UsageNpmDownloads() {

    const labelDownloads = '{total}/month';

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

    return (
        <div className="usage-npm-downloads">

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

        </div>
    );
}
