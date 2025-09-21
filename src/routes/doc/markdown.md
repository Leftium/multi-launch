## MultiLaunch: <small>Bookmarks/Start Page for Power Users!</small>

<br />

### First, Check Out Some Sample Launch Plans:

<br />

#### [Shopping][10]

- Search multiple shopping sites at once.

#### [Svelte Launch Plans][2]

    | QUERY         | The blue Svelte button...                                                                 |
    | ------------- | ----------------------------------------------------------------------------------------- |
    | *Empty*       | Opens all the Svelte "news" pages (Discord, Reddit, StackOverflow).                       |
    | `search term` | Opens all the searchable pages (Reddit and StackOverflow) with results for `search term`. |

    The SvelteKit documentation links are neither frequently-updated "news" nor URL-searchable, so they are _excluded_.
    -   Directly clicking still opens them, though.
    -   The Svelte and SvelteKit documentation have search, but lack a URL interface.
    -   (If the documentation supported URL searches, it could be included here. Imagine searching both the Svelte and SvelteKit documentation at the same time!)

#### [Translate Korean-English][1]

- The Translate buttons automatically detect Korean/English QUERY input.
- Support for other language could be added, too.
- Notice Papago also accepts URL's as input (to translate the whole page).

#### [Multi-Translate from English][8]

- Useful for translating app release notes into multiple languages.
- Tabs are reused across multiple searches. (When possible. Some sites like Google.com prevent tab re-use.)

#### [Image Search][9]

- Some of the image buttons support reverse image search. Just enter the URL of an image like [this][5].

#### [News: FOMO][3]

- A collection of social news sites I check regularly because there is no reverse-chronological feed (or it is limited).

#### [News: No FOMO][4]

- A collection of social news sites with a reverse-chronological feed (so there is no need to check often).

---

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

---

### Launch Plan Editor Quick Tour

1. Open a MultiLaunch page like [Svelte Launch Plans][2].
2. Click "Edit"
    - This opens the launch plan editor. You can edit/save/share this launch plan.
3. Edit "Svelte Launch Plans" to "My Personal Launch Plans".
    - The changes appear live, in real-time!
4. Click "Save".
    - This saved the launch plans to your browser cookies.
    - The launch plans stored in the cookies will be used by default if the URL does not contain a launch plan.
5. Open another MultiLaunch page like [News: Sorted by Time][4].
6. Click "Edit", then "Add"
    - The "News: Sorted by Time" launch plans have been added to the end of your saved launch plans.
    - This is only a preview!
7. Click "Save" to save the new launch plans to your browser cookies.
    - Create your own custom launch plans by adding and saving launch plans shared by other people!
8. Click "Share" to share a link with the current launch plan.
    - The link is automatically pasted to your system clipboard.

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

3. Each button will try to reuse its own tab. (When possible. Some sites like Google.com prevent tab re-use.)

4. You don't need to close all the tabs one at a time; close multiple tabs at once:
    - Right-click a tab, then "Close other tabs" or "Close tabs to the right".
    - Or just close the entire browser window while another browser window is open.
5. You can paste a query even when focus is outside the text box.

6. Toggle the QUERY input fullscreen mode by clicking the fullscreen icon.
    - (Fullscreen mode has a word/char count!)

7. Secret keyboard shortcut for fullscreen QUERY edit mode:
   <kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>SHIFT</kbd> - <kbd>ENTER</kbd>

8. Launch plans can even be [nested in other launch plans][7]!

9. Source code at: https://github.com/Leftium/multi-search

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

<br /><br />

[10]: /?p=C4S2BsFMAIF5oOQGUAWB7ADhkA7A5ggFCEDaqm2+AdAOJpp5QC6hAJpAGYCGAruMHGgAiFMGAYAzgC4A9DIDuiqnnqNIVAMZoAtjImQuAJw0oA-AEdYARQCqAUQBKATQBkwAEbbYE9BiHEyX0o8KgBBbS4ALzQcFnZuPgF4ETFJWQUlLgjonE0dPVMAa2t7ZxdDTlgcdwB9CVqcNAkJf1JyLFwQu3cuAE84zl5+QRTxaTlFeSpIHt683QkTGRAqUW1wUxqcQvkSxychIA
[9]: /?p=C4S2BsFMAIF5oEQEkC2BDA5jAypNAnAYwAsEAoMgbVU0gGcA6AcQHsWMoBdMkAM3BAA7ANZxExYMAAOdAFwB6eVEGMMbDpAaEWKeQFcp4FmgAmAIwCee-OAD818LACKAVQCiAJQCa5E5F5oeuDAYggS0nKKAO4xDGrsUFo68nR4RMS2wGYosCB0JABkAI7O7t7kVDRYjAByaABukPjcfAIiob7+gcGh4TIKKWkkDIINTUm6qQTDo434tlHETZC56FjFek0WpZ4+FNRr9AwAIoEoLfxCovAInQFBITd9kYPTxAwmZyOQwK-pC6sMMUduV9lUjgAhIQYC5ta7iST9aKxMzQibyECHOh-Ei2eogSBRWB+YBoEDgeoAJgKeTosDoqOBmIwDlkrl2d26jwREQGMSiDFRggw6MxtGxU3+JXZoMqWIYXjQgj8AA9YVdeoiXhYlarRVicRl8FJgKtaPjCQUHCC9n57j0nlqBjrlZAVfrxYbMm7TTK9nLxQwXCpDGg6MR1e0bpyHpreYo9CHwGH3tpJvIpMQWMAWNi-RUDoGAAogFVoMxoCyR+G3Mh2rlxpEZ0vlyse6qG+T5sHyotuyDgOjVjp1rqxx3x+T8hhSfuD9GSkhdspeeQF8GMbA5wjCYMCFBgSAmYfR0f27lhJ3IgV0bfCRP7w8mdGNQg5-AAWjFWHkCxY+BMG113lRULA3E9EBjB0eSbHULG-I40y9YALFnWAPwARgKTN8DDFZuyAA&q=dogs
[8]: /?p=C4S2BsFMAIF5oEQFkCu5QFoAqAnAhgHYDO4ewMAZjgPYC20AogQObghEAWCAUNwNoBxatVaQAdAGUADoXYcAutwAmkCnjTA40AOQdgwKUQBcAehPB8xUuTHNhosQGM6JgPwlYkAgDIInor6QAB7AsACKAKoMAEoAmt7UUrAWhCRkkNq8gvZQYgAK1DjAKMwokESQiipqGlq6+oam5pZpNnYiuc60bh5evuCwUsCBIeFRcQlJKVbpmfxCHeIAYjhejgrKqurodXoGxmbTreLtDl09A31+VCOhkTHxickt1hlZCw4CkDi0hFVbtXg9X2TSOr1sOXE53clx8fhUtzGD0mz1Srzm2UWYgAaiBIMACHhaOVKpsajsgXtGocXukIVjob04QMAG4gRH3CZPMGzd6QsTRFBEIggP5k7aaSkNA7NNF006dFwwzzM2A4FAc8aPKa08hzfh5PAyOySGQEOT-cmSnRUmUyY3UMSElnfJxKpm+ADW-m8RDuWoxhod+UKxVKJMtEt20qa9rwJudrsZsK9g2GfqRcUDRvjjpWaw21SjUpBZjjCbwLpwbu6yqu3puGc5sWzwa+PzFRcBNpjZZzFarNYuKtTCKbAayQdzOLxBKJEfF3eB1JM5cdieryZHwG9bN9-oerenguFooIkaXttj-fXlaT7pTO7VGvHh+4QA
[7]: /?p=C4S2BsFMAIF5oEQDlIGdiQCbQDIEMBXAOwGMALaABXDyNQQCgGBta21AOgQBUAndmhmgBpAPa9ItALQBRIgHNwIVGQQBdBpkgAzQuGBxEAegD8AB1gBhACwBlAEwAhVADEAsgEEAki4CsomQBFRwBVRwB5RwARD0x5AC0AZgBxazdHMw9IAA8QgGsAdxdRRwAlGJJEx0sCj1QZD1EXeQAjADUQ7IAvAAZ5KNEPazzbACkARi8PAA1SgE15D3iAN0CCx15wrxpfPA9tbnAXF0tS1GSPDwAJHA8bDwBON0gos1QCbSvs3ijS7Q83PEGsBUHMogAOcIAdUcJTyMihow82W0tkulDmzQ8pWCbVsi3AHhk42WXgAVuM5iR7NZeLYXHMiX0zEgPI5piQLsArtMemSQuNuDhpmRUAB2YQyEjTTA9cEeRKJDykkBRQIgcJk6zZcK2YREIjZKFREC+YQANlqLiQUR6PShBXAZihgTa1naPSiMnsSFGAE9MKgANRRNUeJB9ELccjyObrRJojxknBRRxeJBKkCOLqBUTaHqWVDkv1hHpkObacIeGlqkLJEBXUZiyBIazAYTCHU4YTcDw9TC2PCOObgeJ4AC2SHi3C8IBaV3iYvCAEcCFFsn62sug1draVY1DLo5x+DjTZKCAoaU-UGQp3bFD4m0oTJsqU8Eh7EG-SQocICkGbg1I42SUHkoyjDgowuBaeTCJcABky6wGQwDAG8ABcRhGEQE4EBwBQgHkIBGAURi2MskD6JAjAsGwdBcF4454PIMC2JIvDkOomg6HoBjwAgpgWDYDjOO43h+AEgQyHklhODEvhkh4fosh4RAeHGdQNKIbitB0fTJCQHjmh4JCBFcqBQm4JSYG4eQAlUlxiuG8TZK+cyeB44SYB4LjrOakBtDIyRuG4LSvB4eAIsIkCBC4JBmNYLjjos47eAUliQJAUhVhC4zgrcljwW0gSWCAHijKVeC+DIviSZAa4afI8i2D0RAdl52pRMkvCoCExTmuCRClNYpRuA4BTJHMoioJYjg9Eijj2V4S5isAYp5G0vxzEpjh+nsjgEHklBkiQ-yzqILRikG8icmQ1gzh2UJ5HkUReOm3AhOO5rLoE3ADNYiRtuAVwyNw8SWL45ouGSLiQHk9pmPE1hBnuvAPB4tReAEog4No2SWKIyzeEQcVptwmAPHkcyUNw2SY+O8R+uEazCFIZiWOaqChSEmAEG0DzgCEZKLGQXiBHMkPAHgYogLY3APHgnZuDmc5+jIlhXOEZCyCA9iQKILVlDCQZzLCMhRKxgyjPIMXcDNAzLpE45eAUUTgHkvDgPYmD2OaZIFKUQQhbYqouPu8gFOabjZMAyS5IkQajNM8Q6cuUJeHM0xkoE8hkvKjxzG0WiiCAIojngvClG0IAkKU4Dgi4NvCNLJ2WIEIRXJYlgPEQvhimSbXgMujhkl78QeG02i8NkcwtG445itw3DCL3ODZGs0yWGY3XyNHpTjJAPQtGYfpXGYEjTQ8muTVciToaMpJmG4gRWR4UJICAUilCEAwXI08gXBtB0tkUQlg-SlCDMkRIbgyD2C9tkMwMh4g9GWOAP0qBIA-WSEGbgvhUBXD9KIYABA-SW01G0MkZhxi8GXNkbIiRsi4PBGQMgthtBrgeMkWweQyCBjMFlOK4IQotA8L4AoZJLAeUsC4RwLUPDjgrKUHo2h7BinAGQUYiQvDyDaMfbQpxKBigKOCccmBkhIFzr4KQlwoSwyhFcWSs8gyODcMkcY4xEjgB-rcRIMgHgyFHvNSAth5whBwMkKQXhrA9D9A8RkOAXBEEPJQWo+4exIHBKGFw8RSGIWQqhdCqAsJGDMDQEg8MwAYCIBwEgohxxGHBHaIwvg7S0VYDQBiCAKJUSEPgYg5AqCdPoBoLQugCD6EMIJcwVg7BOFcJ4Hw-hg5hAmV0ORyRAiZ3ih4ZymlgCDHilcDwCQCilTIOaRwwBi69nCPIRwQQ8BZmcjIawHhew4F4D0QIAIMrhBCd4TKddlKbNGCGGQohAjgEjpcGJMxrhmBzkQZY9grjACDO-ew4Rh6OEwFEN+h5-yOHsBVdYFwZC1CiKMAKUgQANC1r4SAHhkh+gINkeQXQ3C8EcCAQIzlHDCHhDgcck1hC2DcO1YQ4IkDLkuXOC44RrBtGcl4eIUJMDxHBHECJSBkhkiRAyAgvohgeGXNwC4lBsi2FQHceCYhGjLnsuOEAZhlzJFQI4PA4RlhmGSGYMgbRwBtG4G0eQmBAjjCQDgeIZJgDZDyL4BucZ3h+nAK7KIZAGhIEZKY+QlgZAEEcOCNVwhZVEBAHgcsqAnRklsNMJAXRrBRD9JAHAfp7DcFsOaSgpQpjjEWE3JUHgyDxDeLYKI0x0gFC6IsPAZIyAgBwOEc0XhQEFHHD0HUthAjWEsJcHo45YSjAAkEc0yRRhTA8JQck8hKCWGXKMXsHhbA-k7S6YQlVTJ9weFcSAJAiiUHsFCbI3iChXDmLYXUYoXB3iiG4X0JApheBuNYQIAdSguH2N4QIqBbBJDmGQ8IbQiOazMNwUY8QWiUHkFcYQvh+a+EcFCZqBAXCoB6EGcEiR5BSEoC4Mwgbjl4nQlIeCHh2n0U4MgSABRinQCQMQ6AqBxAYGwC0P00BuAgHHDRUZvEJn8WMDMkS8zxJLKku7ZDJAohVgIHgcd9hEHjCMkQCDRJ7B5vSJQPAIR359AGNpJArQoTcGmMxmQEWuh3B0WIl2nMWgJTZGlNYlgCBvOJj8nAHlLjQivdwMUnR6PTBhmlOY4wChIAeGKHAAcMpkEsBw-oUIehsgvTIHo9hprLjwKIMghAzAgGSMkZcZI3Cd2EC1eQRokDLEGKBUQwgrjLAS5Kc0lheAeCiMIHqIBRCJF4NdcEqBlzLhIJrL1BArjmjyJgQhZlknAGXEQXrLFxbiaYB09gXAUCyYwtAWwKmsDQHU5p7TumeLjMmQJISszRILIksswIlmrjWds0OQkDx5AyDFO3BRLX9xNh+cuKY6ETkuDg1EPA+1zQtdzjRrZRJ5AhQ8P2pHjqSDNU5l0GQmRjweBS2luYoNMvZa8ikwIRBMDLm0OAZIUIyDjAeNoRdvQhSYDMAUP04JHAeBCMEElJBxghFsJQMs9zbACm4FCcY1hHBXD5J0JAIRSiUF8F4fMls3kkCIC4Sk4RMPgiDNoMkvQrhEEcOMJMlgtqtXMemMk-0kAyD9NkcEBASDgGEJYbg4QSAyCmAgIAA
[6]: /?p=MQAgIgpgLhBOC2BLAdhAziA7gCwIZREQwBMiAHAG1wE8JjDkQAjKgYwGsQ7EoB7WZrgH4QfMgDoAUFB4UIIALwgARAGVc8SvIAyuAK7JW2EAAUqjACoB5ALLblkyaACCo3C3nFocJKgxRseTRoGWQAcwwAM34uXCNmPSg+ZCkXCgoQYKSUCJBeMhleZFwKABouAA9WCAKQaIEvSP0KKCkAbQBxACUrAFUTcQAhXotrADkAXScQAHVAxihYPQhygPkWZZBWfAgw-moEpKKsRHTM9kQyUWwiQ+SsebyyCGQckBKMihR2NCkIKooei8ilESwgjlAvS62kIkWu8gAjstYAcUGREiA8BhcCAAG4lZbiEAAAwAir0AKJdACaxMIGFgNTYdBOAXheIJ8l4cLWICRcFRyHRrUkiEi-JRIOU2CSZDQAC4APSK-4aLTiVi8eAAfgRCnJVOpDmmUJhYvZEoO+MB8luOK+yHYUjFDs4SmlsoVytVmjkGq1xsh0NhFuRVs59JAAGl+BBcAt-iLzGEAPrsXhSmVQOVKlUVNV+zXwQMgCyBECNZpQco4F4gMiM3GIXh6DCmgDkJEQ9GQvAI8HwRiklb0LUzntzPvVReN03U8HkYVgLbIkk6PX6QxG4xTgymI7H7qzOe9+d9EH9xcc0zAYsicBeBCXK7X3T6Jl3W9GVjGu-3ECaUcCCPCdTwLC8Z0kIA
[5]: /?p=C4S2BsFMAIF5oEQEkC2BDA5jAypNAnAYwAsEAoMgbVU0gGcA6AcQHsWMoBdMkAM3BAA7ANZxExYMAAOdAFwB6eVEGMMbDpAaEWKeQFcp4FmgAmAIwCee-OAD818LACKAVQCiAJQCa5E5F5oeuDAYggS0nKKAO4xDGrsUFo68nR4RMS2wGYosCB0JABkAI7O7t7kVDRYjAByaABukPjcfAIiob7+gcGh4TIKKWkkDIINTUm6qQTDo434tlHETZC56FjFek0WpZ4+FNRr9AwAIoEoLfxCovAInQFBITd9kYPTxAwmZyOQwK-pC6sMMUduV9lUjgAhIQYC5ta7iST9aKxMzQibyECHOh-Ei2eogSBRWB+YBoEDgeoAJgKeTosDoqOBmIwDlkrl2d26jwREQGMSiDFRggw6MxtGxU3+JXZoMqWIYXjQgj8AA9YVdeoiXhYlarRVicRl8FJgKtaPjCQUHCC9n57j0nlqBjrlZAVfrxYbMm7TTK9nLxQwXCpDGg6MR1e0bpyHpreYo9CHwGH3tpJvIpMQWMAWNi-RUDoGAAogFVoMxoCyR+G3Mh2rlxpEZ0vlyse6qG+T5sHyotuyDgOjVjp1rqxx3x+T8hhSfuD9GSkhdspeeQF8GMbA5wjCYMCFBgSAmYfR0f27lhJ3IgV0bfCRP7w8mdGNQg5-AAWjFWHkCxY+BMG113lRULA3E9EBjB0eSbHULG-I40y9YALFnWAPwARgKTN8DDFZuyAA&q=https://placekitten.com/800/500
[4]: /?p=C4S2BsFMAIF5oEQDlIHcDOAuaSD20AxAeQFkiEAoCgbWTXWgCEEA6BACQGMBrAJwHVIAIwQBdCgBNIAMwCGAV3DA4iABbBgABywB6HatQso00PIC2LTrjM7KNOhiasAogDsA5rInvIwcVLlFZXgEdS1dHVQolkgPLx9gS2tbKloUR2YWdPRGcHlefxkFJRVQjW1MPSjDV3ohPN4kmwQgA
[3]: /?p=C4S2BsFMAIF5oEQDlIHcDOAuaAxA8gLJ4IBQJA2smutAIIIB0AIiAOasC6JAJpAGYBDAK7hgcRAAtgwAA5YA9PNTKG3NqwYBjAPYBbeaQpUMdRglroA1tAASSBF16CRY+AimzMiiagZQ+oEK6WnryAMTyAlaGlCgm9AwIAMoS2qi29o78wqLi7tIyXvI+fvyBwTr6EeipqAhAA
[2]: /?p=C4S2BsFMAIF5oEQGUBulzBgGQIYFcA7AYwAtoAFcHAgZwQCh6BtVdTAOgBEQaiB7AE4ATALr0QAMwCOeSAICecRAyGQJ+DEoQlgwAA40AXAHpjQnv2Ht+AW2OlqBdDWMAWAKwB2AJwBGAEwADJ6e-iEAHO5eAGyuxgzMrBiQ7ABKkELmwGKSMnKK8Nq6BibGAO4V7AIZWdZ8dgLGNGjJAFYuNJA4AqTGAPxSsACKAKoAoqkAmipqGsBaOvpGphVlVTVgdQ1NLZjtxk5l8YwsuylIwDhEANYA8mgCEuB8ZWKq6niahYslpjSXNz4DyeLy2TS6PRIA1gAFJ3AAhZpsSDXMBwzgAajhiLO6Ixowm0xOSQ4CAA0mBoJw+EQ6GJIAAPIjgPCqJTAASycTSWQKJQAcn59HecwFP2WxlRwHYSOS7FUKDMNJcIAIHL4QjwRFAfAIQsSZ3YyDOVOVCHpTJZbPgHK5uV5BWgguFs0+83g-PFpVlHAVStp-KAA
[1]: /?p=C4S2BsFMAIF5oEQBUBOBDAdgZ3G4MBpAexUkwFoBRDAc3BCwAsEAoFgbVUxz0gDoA4kSJ1IAXRYgAZvQwBrOIla5aAfTlFFCRsGAAHLAC4A9MeDpsufHxrDRfAMZEAtsYD8OWBoBkEWJAxfSAAPYFgARQBVSgAlAE1vIj1Yc24rSFYAE0gpNABXcGAtHX0jU1TLXhs7KEcXd08A33AvIiDQiOj4xOSKnnxWDi5K6wAFND00WwlpWQV4bV0DE2NJyds+DDQAN0gUTchgYwB3SAAjLDBIN3AiBzQof0CsIjyUB0hYfOA24DQUGiHJ7eN4tKKxOLKTA0dSaBYlZamNZTIibHZ7OquDxyVq+HFNRgYWAABm8WDC4PiWRy+UKxSWZVWExRaN2+ycWKw+MCwBxPkJJLJFK6kKAA&q=https://namu.wiki/w/Svelte
