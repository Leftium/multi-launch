## MultiLaunch: <small>Bookmarks/Start Page for Power Users!</small>

<br />

### Launch Buttons Quick Tour

1. Open a MultiLaunch page like [Svelte Launch Plans][2].
2. Click the "Reddit" button.
    - The Svelte Reddit page is opened.
3. Enter "hackathon" into the query input. Click the "Reddit" button again.
    - This time the Svelte Reddit search results are opened.
4. Clear the query input (<kbd>SHIFT</kbd>-<kbd>DEL</kbd>), then click the blue 'Svelte' button (<kbd>ENTER</kbd>).
    - Three tabs are opened (Discord, Reddit, and Stackoverflow)
    - The blue buttons contain the name of the group, and simultaneously open all the dark gray buttons.
    - The light gray buttons are _excluded_ from the group open, but may be opened manually by clicking.
    - <kbd>SHIFT</kbd>-<kbd>DEL</kbd> and <kbd>ENTER</kbd> are keyboard shortcuts.
5. Enter "auth" into the query input. Click the blue 'Svelte' button, again.
    - This time, only two tabs are opened (Reddit and Stackoverflow). Both tabs show the results of searching for 'auth'.
    - Notice the Discord button became light gray to indicate it is not part of the group open. Discord does not support searching via URL.

### Launch Plan Editor Quick Tour

1. Open a MultiLaunch page like [Svelte Launch Plans][2].
2. Click "Edit"
    - This opens the launch plan editor. You can edit/save/share this launch plan.
3. Edit "Svelte Launch Plans" to "My Launch Plans". Click "Save".
    - This saved the launch plans to your browser cookies.
    - The launch plans stored in the cookies will be used by default if the URL does not contain a launch plan.
4. Open another MultiLaunch page like [News: Sorted by Time][4].
5. Click "Edit", then "Add"
    - The "News: Sorted by Time" launch plans have been added to the end of your saved launch plans.
    - This is only a preview!
6. Click "Save" to save the new launch plans to your browser cookies.
    - Create your own custom launch plans by adding and saving launch plans shared by other people!

---

### Tips

1. JavaScript is not required! MultiLaunch uses progressively enhanced forms.
2. Control where the links are opened (just like regular browser links):

    | Input                            | Opens in          |
    | -------------------------------- | ----------------- |
    | _No modifier keys_               | Current tab       |
    | <kbd>CTRL</kbd>                  | Background tab(s) |
    | <kbd>CTRL</kbd>+<kbd>SHIFT</kbd> | Foreground tab(s) |
    | <kbd>SHIFT</kbd>                 | New window(s)     |

    Works with both <kbd>ENTER</kbd> and button clicks.

3. You don't need to close all the tabs one at a time; close multiple tabs at once:
    - Right-click a tab, then "Close other tabs" or "Close tabs to the right".
    - Or just close the entire browser window while another browser window is open.
4. You can paste a query even when focus is outside the text box.

5. Secret fullscreen query edit mode (with word/char count): <kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>SHIFT</kbd> - <kbd>ENTER</kbd>

6. Source code at: https://github.com/Leftium/multi-search

---

### The Launch Plan Format

Launch Plans are TOML-formatted: [Sample Launch Plan TOML annotated with comments][6]

```
# Determines what is displayed in black editor bar at top.
title = "Sample Launch Plan TOML"

# A table determines the settings for each button.
# All settings optional, except for default.
[GROUP.BUTTON]
# When true, the blue category button will skip this button when opening all links.
exclude = true

# URL if the query input has a value. `QUERY` is replaced with the value of the query input.
ifquery = "https://example.com?q=QUERY"

# URL if the query value is a link.
iflink = "https://example.com"

# URL if the query value is Korean text.
lang_ko = "https://example.com"

# The default, when previous URL's did not match.
default = "https://example.com"


# Same group
[GROUP.BUTTON_B]
default = "https://example.com"


# Different group
[GROUP_B.BUTTON_B]
default = "https://example.com"
```

---

### Sample Launch Plans

#### [Translate Korean-English][1]

-   The Translate buttons automatically detect Korean/English query input.
-   Support for other language could be added, too.
-   Notice Papago also accepts URL's as input (to translate the whole page).

#### [Image Search][5]

-   Some of the image buttons support reverse image search. Just enter the URL of an image like [this][5].

#### [Svelte Launch Plans][2]

-   Without any QUERY, the blue Svelte button opens up the Svelte "news" sites: Discord, Reddit, StackOverflow.
-   With a QUERY, the blue Svelte button opens up all the searchable sites (Reddit and StackOverflow)
    -   The Svelte(Kit) documentation has a search, but it cannot searched via URL. If the documentation URL searches, it could be included!
-   The SvelteKit documentation is neither "news" nor URL-searchable, so they are _excluded_. (Direct clicking still opens them, though.)

#### [News: Not sorted by Time][3]

-   A collection of social news sites I check regularly because there is no reverse-chronological feed (or it is limited).

#### [News: Sorted by Time][4]

-   A collection of social news sites with a reverse-chronological feed (so there is no need to check often).

<br /><br /><br /><br />

[6]: /?p=MQAgIgpgLhBOC2BLAdhAziA7gCwIZREQwBMiAHAG1wE8JjDkQAjKgYwGsQ7EoB7WZrgH4QfMgDoAUFB4UIIALwgARAGVc8SvIAyuAK7JW2EAAUqjACoB5ALLblkyaACCo3C3nFocJKgxRseTRoGWQAcwwAM34uXCNmPSg+ZCkXCgoQYKSUCJBeMhleZFwKABouAA9WCAKQaIEvSP0KKCkAbQBxACUrAFUTcQAhXotrADkAXScQAHVAxihYPQhygPkWZZBWfAgw-moEpKKsRHTM9kQyUWwiQ+SsebyyCGQckBKMihR2NCkIKooei8ilESwgjlAvS62kIkWu8gAjstYAcUGREiA8BhcCAAG4lZbiEAAAwAir0AKJdACaxMIGFgNTYdBOAXheIJ8l4cLWICRcFRyHRrUkiEi-JRIOU2CSZDQAC4APSK-4aLTiVi8eAAfgRCnJVOpDmmUJhYvZEoO+MB8luOK+yHYUjFDs4SmlsoVytVmjkGq1xsh0NhFuRVs59JAAGl+BBcAt-iLzGEAPrsXhSmVQOVKlUVNV+zXwQMgCyBECNZpQco4F4gMiM3GIXh6DCmgDkJEQ9GQvAI8HwRiklb0LUzntzPvVReN03U8HkYVgLbIkk6PX6QxG4xTgymI7H7qzOe9+d9EH9xcc0zAYsicBeBCXK7X3T6Jl3W9GVjGu-3ECaUcCCPCdTwLC8Z0kIA
[5]: /?p=C4S2BsFMAIF5oEQEkC2BDA5jAypNAnAYwAsEAoMgbVU0gGcA6AcQHsWMoBdMkAM3BAA7ANZxExYMAAOdAFwB6eVEGMMbDpAaEWKeQFcp4FmgAmAIwCee-OAD818LACKAVQCiAJQCa5E5F5oeuDAYggS0nKKAO4xDGrsUFo68nR4RMS2wGYosCB0JABkAI7O7t7kVDRYjAByaABukPjcfAIiob7+gcGh4TIKKWkkDIINTUm6qQTDo434tlHETZC56FjFek0WpZ4+FNRr9AwAIoEoLfxCovAInQFBITd9kYPTxAwmZyOQwK-pC6sMMUduV9lUjgAhIQYC5ta7iST9aKxMzQibyECHOh-Ei2eogSBRWB+YBoEDgeoAJgKeTosDoqOBmIwDlkrl2d26jwREQGMSiDFRggw6MxtGxU3+JXZoMqWIYXjQgj8AA9YVdeoiXhYlarRVicRl8FJgKtaPjCQUHCC9n57j0nlqBjrlZAVfrxYbMm7TTK9nLxQwXCpDGg6MR1e0bpyHpreYo9CHwGH3tpJvIpMQWMAWNi-RUDoGAAogFVoMxoCyR+G3Mh2rlxpEZ0vlyse6qG+T5sHyotuyDgOjVjp1rqxx3x+T8hhSfuD9GSkhdspeeQF8GMbA5wjCYMCFBgSAmYfR0f27lhJ3IgV0bfCRP7w8mdGNQg5-AAWjFWHkCxY+BMG113lRULA3E9EBjB0eSbHULG-I40y9YALFnWAPwARgKTN8DDFZuyAA&q=https://placekitten.com/800/500
[4]: /?p=C4S2BsFMAIF5oEQDlIHcDOAuaBlA9gE7CQAm0ARgJ7QAqIAtpAgFDMDaya60AQggHQIAEgGMA1gQDqkcggC6zEpABmAQwCu4YHEQALYMAAOWAPQndqflGWh19fiLz0TLdpwy8BAUQB2Ac1USP0hgBSU1TW14BH0jUxNURP5If0Dg4AcnF1YOFA8+fjz0HnB1AjCVDS0dGINjTDNEyx8uclKCTOcEIA
[3]: /?p=C4S2BsFMAIF5oEQDlIHcDOAuaSD2xp1cAnYSAE2gCMBPaUAW0gDoEAoNgbWTXWgEEEzACIgA5mIC6bcpABmAQwCu4AvAQALYMAAOWAPT7Ux5uXFjmAY1wN97LjwwChCfugDW0ABJIE02YoqaohaupiGGqjMUHKgSgxWNvoAxPoKHvbcKE6CrADKGrio3r7+8sqqcCHaOuH6kdHycQnWtqnohagIQA
[2]: /?p=C4S2BsFMAIF5oEQGUBulzBgGQIYFcA7AYwAtoAFcHAgZwQCh6BtVdTAOgBEQaiB7AE4ATALr0QAMwCOeSAICecRAyGQJ+DEoQlgwAA40AXAHpjQnv2Ht+AW2OlqBdDWMAWAKwB2AJwBGAEwADJ6e-iEAHO5eAGyuxgzMrBiQ7ABKkELmwGKSMnKK8Nq6BibGAO4V7AIZWdZ8dgLGNGjJAFYuNJA4AqTGAPxSsACKAKoAoqkAmipqGsBaOvpGphVlVTVgdQ1NLZjtxk5l8YwsuylIwDhEANYA8mgCEuB8ZWKq6niahYslpjSXNz4DyeLy2TS6PRIA1gAFJ3AAhZpsSDXMBwzgAajhiLO6Ixowm0xOSQ4CAA0mBoJw+EQ6GJIAAPIjgPCqJTAASycTSWQKJQAcn59HecwFP2WxlRwHYSOS7FUKDMNJcIAIHL4QjwRFAfAIQsSZ3YyDOVOVCHpTJZbPgHK5uV5BWgguFs0+83g-PFpVlHAVStp-KAA
[1]: /?p=C4S2BsFMAIF5oEQBUBOBDAdgZ3G4MBpAexUkwFoBRDAc3BCwAsEAoFgbVUxz0gDoA4kSJ1IAXRYgAZvQwBrOIla5aAfTlFFCRsGAAHLAC4A9MeDpsufHxrDRfAMZEAtsYD8OWBoBkEWJAxfSAAPYFgARQBVSgAlAE1vIj1Yc24rSFYAE0gpNABXcGAtHX0jU1TLXhs7KEcXd08A33AvIiDQiOj4xOSKnnxWDi5K6wAFND00WwlpWQV4bV0DE2NJyds+DDQAN0gUTchgYwB3SAAjLDBIN3AiBzQof0CsIjyUB0hYfOA24DQUGiHJ7eN4tKKxOLKTA0dSaBYlZamNZTIibHZ7OquDxyVq+HFNRgYWAABm8WDC4PiWRy+UKxSWZVWExRaN2+ycWKw+MCwBxPkJJLJFK6kKAA&q=https://namu.wiki/w/Svelte
