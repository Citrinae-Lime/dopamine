import assert from 'assert';
import { IMock, It, Mock, Times } from 'typemoq';
import { Desktop } from '../../core/io/desktop';
import { Logger } from '../../core/logger';
import { BaseSettings } from '../../core/settings/base-settings';
import { SettingsStub } from '../../core/settings/settings-stub';
import { Folder } from '../../data/entities/folder';
import { BaseDialogService } from '../../services/dialog/base-dialog.service';
import { BaseFolderService } from '../../services/folder/base-folder.service';
import { FolderModel } from '../../services/folder/folder-model';
import { BaseIndexingService } from '../../services/indexing/base-indexing.service';
import { BaseTranslatorService } from '../../services/translator/base-translator.service';
import { AddFolderComponent } from './add-folder.component';

describe('AddFolderComponent', () => {
    let desktopMock: IMock<Desktop>;
    let translatorServiceMock: IMock<BaseTranslatorService>;
    let folderServiceMock: IMock<BaseFolderService>;
    let dialogServiceMock: IMock<BaseDialogService>;
    let indexingServiceMock: IMock<BaseIndexingService>;
    let loggerMock: IMock<Logger>;
    let settingsStub: SettingsStub;
    let settingsMock: IMock<BaseSettings>;
    let addFolderComponent: AddFolderComponent;
    let addFolderComponentWithVerifyableSettings: AddFolderComponent;

    beforeEach(() => {
        desktopMock = Mock.ofType<Desktop>();
        translatorServiceMock = Mock.ofType<BaseTranslatorService>();
        folderServiceMock = Mock.ofType<BaseFolderService>();
        dialogServiceMock = Mock.ofType<BaseDialogService>();
        indexingServiceMock = Mock.ofType<BaseIndexingService>();
        loggerMock = Mock.ofType<Logger>();
        settingsStub = new SettingsStub();
        settingsMock = Mock.ofType<BaseSettings>();

        translatorServiceMock.setup((x) => x.getAsync('Pages.ManageCollection.SelectFolder')).returns(async () => 'Select a folder');
        translatorServiceMock.setup((x) => x.getAsync('ErrorTexts.DeleteFolderError')).returns(async () => 'Error while deleting folder');

        addFolderComponent = new AddFolderComponent(
            desktopMock.object,
            translatorServiceMock.object,
            folderServiceMock.object,
            dialogServiceMock.object,
            indexingServiceMock.object,
            settingsStub,
            loggerMock.object
        );

        addFolderComponentWithVerifyableSettings = new AddFolderComponent(
            desktopMock.object,
            translatorServiceMock.object,
            folderServiceMock.object,
            dialogServiceMock.object,
            indexingServiceMock.object,
            settingsMock.object,
            loggerMock.object
        );
    });

    describe('constructor', () => {
        it('should provide a list of folders', () => {
            // Arrange

            // Act

            // Assert
            assert.ok(addFolderComponent.folders);
        });

        it('should set indexingService', () => {
            // Arrange

            // Act

            // Assert
            assert.ok(addFolderComponent.indexingService);
        });
    });

    describe('constructor', () => {
        it('should not show check boxes by default', () => {
            // Arrange

            // Act

            // Assert
            assert.strictEqual(addFolderComponent.showCheckBoxes, false);
        });
    });

    describe('addFolderAsync', () => {
        it('should get translated text for the open folder dialog', async () => {
            // Arrange

            // Act
            await addFolderComponent.addFolderAsync();

            // Assert
            translatorServiceMock.verify((x) => x.getAsync('Pages.ManageCollection.SelectFolder'), Times.exactly(1));
        });

        it('should allow selecting for a folder on the computer', async () => {
            // Arrange

            // Act
            await addFolderComponent.addFolderAsync();

            // Assert
            desktopMock.verify((x) => x.showSelectFolderDialogAsync('Select a folder'), Times.exactly(1));
        });

        it('should add a folder with the selected path to the database if the path is not empty', async () => {
            // Arrange
            desktopMock.setup((x) => x.showSelectFolderDialogAsync('Select a folder')).returns(async () => '/home/me/Music');

            // Act
            await addFolderComponent.addFolderAsync();

            // Assert
            folderServiceMock.verify((x) => x.addFolderAsync('/home/me/Music'), Times.exactly(1));
        });

        it('should not add a folder with the selected path to the database if the path is empty', async () => {
            // Arrange
            desktopMock.setup((x) => x.showSelectFolderDialogAsync('Select a folder')).returns(async () => '');

            // Act
            await addFolderComponent.addFolderAsync();

            // Assert
            folderServiceMock.verify((x) => x.addFolderAsync(It.isAnyString()), Times.never());
        });

        it('should get all folders from the database if adding a folder succeeds', async () => {
            // Arrange
            desktopMock.setup((x) => x.showSelectFolderDialogAsync('Select a folder')).returns(async () => '/home/user/music');

            // Act
            await addFolderComponent.addFolderAsync();

            // Assert
            folderServiceMock.verify((x) => x.getFolders(), Times.exactly(1));
        });

        it('should not get all folders from the database if adding a folder fails', async () => {
            // Arrange
            desktopMock.setup((x) => x.showSelectFolderDialogAsync('Select a folder')).returns(async () => '/home/user/music');
            folderServiceMock.setup((x) => x.addFolderAsync('/home/user/music')).throws(new Error('An error occurred'));

            // Act
            await addFolderComponent.addFolderAsync();

            // Assert
            folderServiceMock.verify((x) => x.getFolders(), Times.never());
        });

        it('should get the translation for the error dialog if adding a folder fails', async () => {
            // Arrange
            desktopMock.setup((x) => x.showSelectFolderDialogAsync('Select a folder')).returns(async () => '/home/user/music');
            folderServiceMock.setup((x) => x.addFolderAsync('/home/user/music')).throws(new Error('An error occurred'));

            // Act
            await addFolderComponent.addFolderAsync();

            // Assert
            translatorServiceMock.verify((x) => x.getAsync('ErrorTexts.AddFolderError'), Times.exactly(1));
        });

        it('should show an error dialog if adding a folder fails', async () => {
            // Arrange
            translatorServiceMock.setup((x) => x.getAsync('ErrorTexts.AddFolderError')).returns(async () => 'Error while adding folder');
            desktopMock.setup((x) => x.showSelectFolderDialogAsync('Select a folder')).returns(async () => '/home/user/music');
            folderServiceMock.setup((x) => x.addFolderAsync('/home/user/music')).throws(new Error('An error occurred'));

            // Act
            await addFolderComponent.addFolderAsync();

            // Assert
            dialogServiceMock.verify((x) => x.showErrorDialog('Error while adding folder'), Times.exactly(1));
        });
    });

    describe('getFoldersAsync', () => {
        it('should get folders from the database', async () => {
            // Arrange

            // Act
            await addFolderComponent.getFoldersAsync();

            // Assert
            folderServiceMock.verify((x) => x.getFolders(), Times.exactly(1));
        });
    });

    describe('ngOnInit', () => {
        it('should get folders from the database', async () => {
            // Arrange

            // Act
            await addFolderComponent.ngOnInit();

            // Assert
            folderServiceMock.verify((x) => x.getFolders(), Times.exactly(1));
        });
    });

    describe('deleteFolderAsync', () => {
        it('should get translated text for the delete folder confirmation dialog title', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            translatorServiceMock.verify((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder'), Times.exactly(1));
        });

        it('should get translated text for the delete folder confirmation dialog text', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            translatorServiceMock.verify(
                (x) =>
                    x.getAsync('DialogTexts.ConfirmDeleteFolder', {
                        folderPath: folderToDelete.path,
                    }),
                Times.exactly(1)
            );
        });

        it('should show a confirmation dialog', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            dialogServiceMock.verify(
                (x) => x.showConfirmationDialogAsync('Delete folder?', 'Are you sure you want to delete this folder?'),
                Times.exactly(1)
            );
        });

        it('should delete the folder if the user has confirmed deletion', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete folder?', 'Are you sure you want to delete this folder?'))
                .returns(async () => true);

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            folderServiceMock.verify((x) => x.deleteFolder(folderToDelete), Times.exactly(1));
        });

        it('should not delete the folder if the user has not confirmed deletion', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete folder?', 'Are you sure you want to delete this folder?'))
                .returns(async () => false);

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            folderServiceMock.verify((x) => x.deleteFolder(folderToDelete), Times.never());
        });

        it('should get all folders if the user has confirmed deletion', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete folder?', 'Are you sure you want to delete this folder?'))
                .returns(async () => true);

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            folderServiceMock.verify((x) => x.getFolders(), Times.exactly(1));
        });

        it('should not get all the folders if the user has not confirmed deletion', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete folder?', 'Are you sure you want to delete this folder?'))
                .returns(async () => false);

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            folderServiceMock.verify((x) => x.getFolders(), Times.never());
        });

        it('should get the translation for the error dialog if deleting a folder fails', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete folder?', 'Are you sure you want to delete this folder?'))
                .returns(async () => true);

            folderServiceMock.setup((x) => x.deleteFolder(folderToDelete)).throws(new Error('An error occurred'));

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            translatorServiceMock.verify((x) => x.getAsync('ErrorTexts.DeleteFolderError'), Times.exactly(1));
        });

        it('should show an error dialog if deleting a folder fails', async () => {
            // Arrange
            const folderToDelete: FolderModel = new FolderModel(new Folder('/home/user/Music'));
            translatorServiceMock.setup((x) => x.getAsync('DialogTitles.ConfirmDeleteFolder')).returns(async () => 'Delete folder?');
            translatorServiceMock
                .setup((x) => x.getAsync('DialogTexts.ConfirmDeleteFolder', { folderPath: folderToDelete.path }))
                .returns(async () => 'Are you sure you want to delete this folder?');

            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete folder?', 'Are you sure you want to delete this folder?'))
                .returns(async () => true);

            folderServiceMock.setup((x) => x.deleteFolder(folderToDelete)).throws(new Error('An error occurred'));

            // Act
            await addFolderComponent.deleteFolderAsync(folderToDelete);

            // Assert
            dialogServiceMock.verify((x) => x.showErrorDialog('Error while deleting folder'), Times.exactly(1));
        });
    });

    describe('showAllFoldersInCollection', () => {
        it('should get settings showAllFoldersInCollection', () => {
            // Arrange

            // Act
            const showAllFoldersInCollection = addFolderComponentWithVerifyableSettings.showAllFoldersInCollection;

            // Assert
            settingsMock.verify((x) => x.showAllFoldersInCollection, Times.exactly(1));
        });

        it('should set settings showAllFoldersInCollection', () => {
            // Arrange
            settingsStub.showAllFoldersInCollection = false;

            // Act
            addFolderComponent.showAllFoldersInCollection = true;

            // Assert
            assert.strictEqual(settingsStub.showAllFoldersInCollection, true);
        });
    });

    describe('setFolderVisibility', () => {
        it('should save folder visibility', () => {
            // Arrange
            const folder: FolderModel = new FolderModel(new Folder('/home/user/Music'));

            // Act
            addFolderComponent.setFolderVisibility(folder);

            // Assert
            folderServiceMock.verify((x) => x.setFolderVisibility(folder), Times.exactly(1));
        });

        it('should disable showAllFoldersInCollection', () => {
            // Arrange
            const folder: FolderModel = new FolderModel(new Folder('/home/user/Music'));

            // Act
            addFolderComponent.showAllFoldersInCollection = true;
            addFolderComponent.setFolderVisibility(folder);

            // Assert
            assert.strictEqual(addFolderComponent.showAllFoldersInCollection, false);
        });

        it('should set all folders visible if true', () => {
            // Arrange

            // Act
            addFolderComponent.showAllFoldersInCollection = true;

            // Assert
            folderServiceMock.verify((x) => x.setAllFoldersVisible(), Times.exactly(1));
        });

        it('should not set all folders visible if false', () => {
            // Arrange

            // Act
            addFolderComponent.showAllFoldersInCollection = false;

            // Assert
            folderServiceMock.verify((x) => x.setAllFoldersVisible(), Times.never());
        });
    });
});