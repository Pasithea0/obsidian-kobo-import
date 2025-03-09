import * as fs from 'fs';
import { App, Modal, normalizePath, Notice } from "obsidian";
import { sanitize } from 'sanitize-filename-ts';
import SqlJs from 'sql.js';
import { binary } from "src/binaries/sql-wasm";
import { HighlightService } from "src/database/Highlight";
import { Repository } from "src/database/repository";
import { KoboHighlightsImporterSettings } from "src/settings/Settings";
import { applyTemplateTransformations } from 'src/template/template';
import { getTemplateContents } from 'src/template/templateContents';

type bookmark = {
    bookmarkId: string
    fullContent: string
    highlightContent: string
}

export class ExtractHighlightsModal extends Modal {
    goButtonEl!: HTMLButtonElement;
    inputFileEl!: HTMLInputElement

    settings: KoboHighlightsImporterSettings

    fileBuffer: ArrayBuffer | null | undefined

    nrOfBooksExtracted: number

    constructor(
        app: App, settings: KoboHighlightsImporterSettings) {
        super(app);
        this.settings = settings
        this.nrOfBooksExtracted = 0
    }

    private async fetchHighlights() {
        if (!this.fileBuffer) {
            throw new Error('No sqlite DB file selected...')
        }

        const SQLEngine = await SqlJs({
            wasmBinary: binary
        })

        const db = new SQLEngine.Database(new Uint8Array(this.fileBuffer))
        const service = new HighlightService(new Repository(db))
        const template = await getTemplateContents(this.app, this.settings.templatePath)

        if (this.settings.importAllBooks) {
            // Import all books, including those without highlights
            const allBooks = await service.getAllBooks()
            this.nrOfBooksExtracted = allBooks.size

            for (const [bookTitle, details] of allBooks) {
                const sanitizedBookName = sanitize(bookTitle)
                const fileName = normalizePath(`${this.settings.storageFolder}/${sanitizedBookName}.md`)
                
                // Check if file already exists
                let existingFile;
                try {
                    existingFile = await this.app.vault.adapter.read(fileName)
                } catch (error) {
                    console.warn("Attempted to read file, but it does not already exist.")
                }

                // Get highlights if they exist
                const chapters = new Map<string, bookmark[]>()
                const content = await service.getAllContentByBookTitle(bookTitle)
                if (content.length > 0) {
                    const highlights = await service.getAllHighlight(this.settings.sortByChapterProgress)
                    const bookHighlights = highlights.filter(h => h.content.bookTitle === bookTitle)
                    if (bookHighlights.length > 0) {
                        const highlightMap = service.convertToMap(
                            bookHighlights,
                            this.settings.includeCreatedDate,
                            this.settings.dateFormat,
                            this.settings.includeCallouts,
                            this.settings.highlightCallout,
                            this.settings.annotationCallout
                        )
                        const bookChapters = highlightMap.get(bookTitle)
                        if (bookChapters) {
                            for (const [chapter, marks] of bookChapters) {
                                chapters.set(chapter, marks)
                            }
                        }
                    }
                }

                const markdown = service.fromMapToMarkdown(chapters, existingFile)
                await this.app.vault.adapter.write(
                    fileName,
                    applyTemplateTransformations(template, markdown, details)
                )
            }
        } else {
            // Original behavior - only import books with highlights
            const content = service.convertToMap(
                await service.getAllHighlight(this.settings.sortByChapterProgress),
                this.settings.includeCreatedDate,
                this.settings.dateFormat,
                this.settings.includeCallouts,
                this.settings.highlightCallout,
                this.settings.annotationCallout
            )

            this.nrOfBooksExtracted = content.size

            for (const [bookTitle, chapters] of content) {
                const sanitizedBookName = sanitize(bookTitle)
                const fileName = normalizePath(`${this.settings.storageFolder}/${sanitizedBookName}.md`)
                
                // Check if file already exists
                let existingFile;
                try {
                    existingFile = await this.app.vault.adapter.read(fileName)
                } catch (error) {
                    console.warn("Attempted to read file, but it does not already exist.")
                }

                const markdown = service.fromMapToMarkdown(chapters, existingFile)
                const details = await service.getBookDetailsFromBookTitle(bookTitle)
                
                await this.app.vault.adapter.write(
                    fileName,
                    applyTemplateTransformations(template, markdown, details)
                )
            }
        }
    }

    onOpen() {
        const { contentEl } = this;

        this.goButtonEl = contentEl.createEl('button');
        this.goButtonEl.textContent = 'Extract'
        this.goButtonEl.disabled = true;
        this.goButtonEl.setAttr('style', 'background-color: red; color: white')
        this.goButtonEl.addEventListener('click', () => {
            new Notice('Extracting highlights...')
            this.fetchHighlights()
                .then(() => {
                    new Notice('Extracted highlights from ' + this.nrOfBooksExtracted + ' books!')
                    this.close()
                }).catch(e => {
                    console.log(e)
                    new Notice('Something went wrong... Check console for more details.')
                })
        }
        )

        this.inputFileEl = contentEl.createEl('input');
        this.inputFileEl.type = 'file'
        this.inputFileEl.accept = '.sqlite'
        this.inputFileEl.addEventListener("change", (ev) => {
            const file = (<any>ev).target?.files[0];
            if (!file) {
              console.error("No file selected");
              return;
            }
          
            // Convert File to ArrayBuffer
            const reader = new FileReader();
            reader.onload = () => {
              this.fileBuffer = reader.result as ArrayBuffer;  // Store the ArrayBuffer
              this.goButtonEl.disabled = false;
              this.goButtonEl.setAttr("style", "background-color: green; color: black");
              new Notice("Ready to extract!");
            };
          
            reader.onerror = (error) => {
              console.error("FileReader error:", error);
              new Notice("Error reading file");
            };
          
            reader.readAsArrayBuffer(file);
          });

        const heading = contentEl.createEl('h2')
        heading.textContent = 'Sqlite file location'

        const description = contentEl.createEl('p')
        description.innerHTML = 'Please select your <em>KoboReader.sqlite</em> file from a connected device'

        contentEl.appendChild(heading)
        contentEl.appendChild(description)
        contentEl.appendChild(this.inputFileEl)
        contentEl.appendChild(this.goButtonEl)
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
