interface FsNode {
  name(): string
  parent(): MDirectory
  relink(newParent: MDirectory, withName: string): void
}

export type FsEntry = MFile | MDirectory;

export class MFile implements FsNode {
  #name: string;
  #parent: MDirectory
  contents: string = "";

  constructor(name: string, parent: MDirectory) {
    this.#name = name;
    this.#parent = parent;
    this.#parent.addEntry(this);
  }

  name() {
    return this.#name;
  }

  parent() {
    return this.#parent;
  }

  relink(newParent: MDirectory, withName: string) {
    const nameConflict = newParent.getEntryNamed(withName);
    if (nameConflict instanceof MDirectory) {
      throw new Error();
    }
    else if (nameConflict instanceof MFile) {
      newParent.removeEntryNamed(nameConflict.name());
    }

    this.parent().removeEntryNamed(this.name());
    this.#name = withName;
    newParent.addEntry(this);
  }
}

export class MDirectory implements FsNode {
  #name: string;
  #parent: MDirectory;
  #entries: Map<string, FsEntry>;

  constructor(name: string, parent?: MDirectory) {
    this.#name = name;

    if (parent) {
      parent.addEntry(this);
      this.#parent = parent;
    }
    else {
      this.#parent = this;
    }

    this.#entries = new Map([
      ["..", this.#parent],
      [".", this],
    ]);
  }

  name() {
    return this.#name;
  }
  
  parent() {
    return this.#parent;
  }

  relink(newParent: MDirectory, withName: string) {
    if (newParent.isSubdirectoryOf(this)) {
      throw new Error();
    }

    const nameConflict = newParent.getEntryNamed(withName);
    if (nameConflict instanceof MFile) {
      throw new Error();
    }
    else if (nameConflict instanceof MDirectory) {
      if (!nameConflict.isEmpty()) {
        throw new Error();
      }
      else {
        newParent.removeEntryNamed(nameConflict.name());
      }
    }

    this.parent().removeEntryNamed(this.name());
    this.#name = withName;
    newParent.addEntry(this);
  }
  
  entries() {
    return Array.from(this.#entries, (pair) => pair);
  }

  addEntry(entry: FsEntry) {
    if (this.#entries.has(entry.name())) {
      throw new Error();
    }

    this.#entries.set(entry.name(), entry);
  }

  removeEntryNamed(name: string) {
    if (!this.#entries.delete(name)) {
      throw new Error();
    }
  }

  hasEntryNamed(name: string) {
    return this.#entries.has(name);
  }

  getEntryNamed(name: string) {
    return this.#entries.get(name);
  }

  isEmpty() {
    return this.#entries.size == 2;
  }

  private isSubdirectoryOf(dir: MDirectory) {
    while (this != dir && dir != dir.parent()) {
      dir = dir.parent();
    }

    return this == dir;
  }
}

export const root = new MDirectory("");

export function getEntryFromPath(path: string) {
  if (!path.startsWith("/")) {
    throw new Error();
  }

  let currentEntry: FsEntry = root;
  for (const segment in path.split("/").filter((s) => s.length > 0)) {
    let nextEntry;

    if (currentEntry instanceof MFile) {
      throw new Error();
    }
    else {
      nextEntry = currentEntry.getEntryNamed(segment);
    }
    if (!nextEntry) {
      throw new Error();
    }

    currentEntry = nextEntry;
  }

  return currentEntry
}

