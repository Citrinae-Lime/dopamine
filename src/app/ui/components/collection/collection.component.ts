import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { Constants } from '../../../common/application/constants';
import { BaseSettings } from '../../../common/settings/base-settings';
import { CollectionPersister } from './collection-persister';
import { TabSelectionGetter } from './tab-selection-getter';
import { AppearanceServiceBase } from '../../../services/appearance/appearance.service.base';
import { PlaybackServiceBase } from '../../../services/playback/playback.service.base';
import { SearchServiceBase } from '../../../services/search/search.service.base';

@Component({
    selector: 'app-collection',
    host: { style: 'display: block' },
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CollectionComponent implements OnInit {
    private _selectedIndex: number;

    public constructor(
        public appearanceService: AppearanceServiceBase,
        public settings: BaseSettings,
        private playbackService: PlaybackServiceBase,
        private searchService: SearchServiceBase,
        private collectionPersister: CollectionPersister,
        private tabSelectionGetter: TabSelectionGetter,
    ) {}

    public get artistsTabLabel(): string {
        return Constants.artistsTabLabel;
    }

    public get genresTabLabel(): string {
        return Constants.genresTabLabel;
    }

    public get albumsTabLabel(): string {
        return Constants.albumsTabLabel;
    }

    public get tracksTabLabel(): string {
        return Constants.tracksTabLabel;
    }

    public get playlistsTabLabel(): string {
        return Constants.playlistsTabLabel;
    }

    public get foldersTabLabel(): string {
        return Constants.foldersTabLabel;
    }

    @HostListener('document:keyup', ['$event'])
    public handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === ' ' && !this.searchService.isSearching) {
            this.playbackService.togglePlayback();
        }
    }

    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(v: number) {
        this._selectedIndex = v;
        this.collectionPersister.selectedTab = this.tabSelectionGetter.getTabLabelForIndex(v);

        // Manually trigger a custom event. Together with CdkVirtualScrollViewportPatchDirective,
        // this will ensure that CdkVirtualScrollViewport triggers a viewport size check when the
        // selected tab is changed.
        window.dispatchEvent(new Event('tab-changed'));
    }

    public ngOnInit(): void {
        this.selectedIndex = this.tabSelectionGetter.getTabIndexForLabel(this.collectionPersister.selectedTab);
    }
}