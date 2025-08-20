/* generate interface CommitRecord referring below object
[
      {
        "id": "d617c65928709c4a6a540c74f9078168ac1ae46d",
        "display_id": "d617c659287",
        "commit_link": "https://cedt-gct-bitbucket.nam.nsroot.net/bitbucket/projects/GBMO/repos/167407-android-capability-bot-protection/commits/d617c65928709c4a6a540c74f9078168ac1ae46d",
        "author": "Ning, Paris [TECH]",
        "author_link": "https://cedt-gct-bitbucket.nam.nsroot.net/bitbucket/users/cn58960",
        "commit_time": "2025-03-04 14:48:38",
        "message": "PBWD-14767 | Version 1.0.2",
        "jira_ids": [
          "PBWD-14767"
        ],
        "branch": "master",
        "pr_details": [
          {
            "id": 462,
            "title": "Master -> UAT",
            "from_branch": "master",
            "to_branch": "UAT",
            "author": "Jiang, Junpu [LF-RB NE]",
            "reviewer": "Yang, Gavin [TECH]",
            "pr_link": "https://cedt-gct-bitbucket.nam.nsroot.net/bitbucket/projects/MP/repos/171631-mp-dbstore/pull-requests/462"
          },
          {
            "id": 461,
            "title": "Feature/db 2025 r2",
            "from_branch": "feature/db-2025-r2",
            "to_branch": "master",
            "author": "Yang, Gavin [TECH]",
            "reviewer": "Jiang, Junpu [LF-RB NE]",
            "pr_link": "https://cedt-gct-bitbucket.nam.nsroot.net/bitbucket/projects/MP/repos/171631-mp-dbstore/pull-requests/461"
          }
        ]
      }
    ]
*/
export interface CommitRecord {
    id?: string;
    display_id?: string;
    commit_link?: string;
    author?: string;
    author_link?: string;
    commit_time?: string;
    message?: string;
    jira_ids?: string[];
    branch?: string;
    repo_name?: string;
    pr_details?: PRDetail[];
}

export interface PRDetail {
    id?: number;
    title?: string;
    state?: string;
    from_branch?: string;
    to_branch?: string;
    author?: string;
    reviewer?: string;
    pr_link?: string;
}

export interface RepoInfo {
  projectSpace?: string;
  repoName?: string;
  repoLink?: string;
}

// export an interface with format { text: string; value: any; byDefault?: boolean }
export interface TableFilterOption {
  text: string;
  value: any;
  byDefault?: boolean;
}