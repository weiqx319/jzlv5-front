import { BookmarkModule } from './bookmark.module';

describe('BookmarkModule', () => {
  let bookmarkModule: BookmarkModule;

  beforeEach(() => {
    bookmarkModule = new BookmarkModule();
  });

  it('should create an instance', () => {
    expect(bookmarkModule).toBeTruthy();
  });
});
