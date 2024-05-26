'use client';

import { useState, useEffect } from 'react';

import { useDebounce, selectAll } from '../../utils/use';

export default function Home() {

    const labelProfile = '{name} - {bio}';

    const githubProfile = [{
        name: 'cenfun',
        link: '/github/profile/cenfun'
    }];

    const [profileName, setProfileName] = useState('');
    const [profileOptions, setProfileOptions] = useState('');
    const [profileLink, setProfileLink] = useState('');

    const profileNameValue = useDebounce(profileName);
    const profileOptionsValue = useDebounce(profileOptions);

    useEffect(() => {
        let link = '';
        if (profileNameValue) {
            link = `/github/profile/${profileNameValue}`;
            if (profileOptionsValue) {
                link += `?${profileOptionsValue}`;
            }
        }
        setProfileLink(link);
    }, [profileNameValue, profileOptionsValue]);

    const profileNameChange = (e) => {
        setProfileName(e.target.value);
    };
    const profileOptionsChange = (e) => {
        setProfileOptions(e.target.value);
    };

    return (
        <div className="usage-github-profile">

            <a name="github-profile"></a>
            <div className="header">github profile</div>

            <details>
                <summary>endpoint</summary>
                <code>https://devimg.vercel.app/github/profile/:name</code>
            </details>

            <details>
                <summary>options</summary>
                <ul>
                    <li>width=600</li>
                    <li>bg=ffffff</li>
                    <li>label={labelProfile}</li>
                    <li>output=svg or json</li>
                </ul>
            </details>

            <details open>
                <summary>examples</summary>
                {githubProfile.map((it) => {
                    return (
                        <p className="inline" key={it.name}>
                            <img src={it.link} alt={it.name} />
                            <code>![](https://devimg.vercel.app{it.link})</code>
                        </p>
                    );
                })}
                <p className="inline">
                    <input placeholder="Enter github name" type="text" value={profileName} onChange={profileNameChange} onFocus={selectAll}></input>
                    <input placeholder="Enter options" type="text" value={profileOptions} onChange={profileOptionsChange} onFocus={selectAll}></input>
                </p>
                <p className="inline" >
                    { profileLink && <img src={profileLink} alt={profileName} />}
                    { profileLink && <code>![](https://devimg.vercel.app{profileLink})</code>}
                </p>
            </details>

        </div>
    );
}
