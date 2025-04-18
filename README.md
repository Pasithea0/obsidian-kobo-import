
--------------------------------

## This fork adds the ability to import **all** books from your Kobo device, not just those with highlights. 
This means you can:

- Import your entire Kobo library into Obsidian
- Track reading progress and status for all books
- View metadata like reading time, completion percentage, and series information
- Still get all highlights and annotations for books that have them

You can enable this feature in the plugin settings by toggling "Import all books".

--------------------------------

How to install this fork?
- Download the Latest Release and install it within Obsidian's plugin folder.
- Use BRAT (Beta Review and Testing) plugin to install it within Obsidian.

--------------------------------

# Obsidian Kobo Highlight Importer

This plugin aims to make highlight import from Kobo devices easier.

- [Obsidian Kobo Highlight Importer](#obsidian-kobo-highlight-importer)
	- [How to use](#how-to-use)
	- [Templating](#templating)
		- [Variables](#variables)
	- [Highlight markers](#highlight-markers)
	- [Helping Screenshots](#helping-screenshots)
	- [Obsidian Callouts](#obsidian-callouts)
	- [Contributing](#contributing)

## How to use

Once installed, the steps to import your highlights directly into the vault are:

1. Connect your Kobo device to PC using a proper USB cable
2. Check if it has mounted automatically, or mount it manually (e.g. open the root folder of your Kobo using a file
   manager)
3. Open the import window using the plugin button
4. Locate _KoboReader.sqlite_ in the _.kobo_ folder ( this folder is hidden, so if you don't see it you should enable
   hidden files view from system configs )
5. Extract

## Templating

The default template is:

```markdown
---
title: {{Title}}
author: {{Author}}
publisher: {{Publisher}}
dateLastRead: {{DateLastRead}}
readStatus: {{ReadStatus}}
percentRead: {{PercentRead}}
isbn: {{ISBN}}
series: {{Series}}
seriesNumber: {{SeriesNumber}}
timeSpentReading: {{TimeSpentReading}}
---

# {{Title}}

## Description

{{Description}}

## Highlights

{{highlights}}
```

### Variables

| Tag              | Description                                      | Example                |
| ---------------- | ------------------------------------------------ | ---------------------- |
| highlights       | Will get replaced with the extracted highlights. | `{{highlights}}`       |
| title            | The title of the book.                           | `{{title}}`            |
| author           | The author of the book.                          | `{{author}}`           |
| pulbisher        | The publisher of the book                        | `{{publihser}}`        |
| dateLastRead     | The date the book was last read in ISO format.   | `{{dateLastRead}}`     |
| readStatus       | Can be: Unopened, Reading, Read.                 | `{{readStatus}}`       |
| isbn             | The ISBN of the book.                            | `{{isbn}}`             |
| series           | The series of which the book is a part of.       | `{{series}}`           |
| seriesNumber     | The position of the book in the series.          | `{{seriesNumber}}`     |
| timeSpentReading | The time spent reading the book.                 | `{{timeSpentReading}}` |

## Highlight markers
The plugin uses comments as highlight markers, to enable support for keeping existing highlights. All content between these markers will be transferred to the updated file. 

```
%%START-<MARKER IDENTIFIER>%%

%% Here you can type whatever you want, it will not be overwritten by the plugin. %%

%%START-EXTRACTED-HIGHLIGHT-<MARKER IDENTIFIER>%%
...highlight
%%END-EXTRACTED-HIGHLIGHT-<MARKER IDENTIFIER>%%

%% Here you can type whatever you want, it will not be overwritten by the plugin. $$

%%END-<MARKER IDENTIFIER>%%`
```

![](./README_assets/IMG_0078.png)
![](./README_assets/IMG_0079.png)

## Helping Screenshots

![](./README_assets/step1.png)
![](./README_assets/step2.png)
![](./README_assets/step3.png)
![](./README_assets/step4.png)

## Obsidian Callouts

Kobo Highlight Importer uses Obsidian callouts for the highlights and annotations imported; Which can be configured
individually. Turning this toggle off will fallback to the standard markdown block quotes for highlights only.

![](./README_assets/Callout_Settings.png)
![](./README_assets/Callouts.png)

Check the [documentation](https://help.obsidian.md/How+to/Use+callouts") to get a list of all available callouts that
obsidian offers.

## Contributing

Please feel free to test, send feedbacks using Issues and open Pull Requests to improve the process. 
