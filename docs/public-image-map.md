# Public image map

The source files remain in the supplied Downloads folders. The prepared copies are intentionally staged outside the Web repository, then uploaded into the existing `resource-uploads` Docker volume. The React application receives only Resource Service IDs through the public Content API.

## Prepared image output

Generate the local staging set from the workspace root:

```powershell
node .\aplus-ict-resource-service\scripts\prepare-public-images.mjs `
  --source-root 'C:\Users\I N T E L\Downloads' `
  --output-root 'F:\Projects\A Plus ICT\prepared-public-images'
```

No source file is overwritten. Logo preparation only trims transparent padding; photo copies are cropped without enlargement and converted to WebP.

| Original attached file               | Prepared filename / resource storage key   | Website usage                                                | Resource title and alt text                                            | Crop / output                                                                   | Content field or page section                                                                           |
| ------------------------------------ | ------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `a plus ict/1.png`                   | `branding/aplus-ict-logo-full.png`         | Optional full official logo                                  | `A Plus ICT full logo`; `A Plus ICT logo`                              | transparent PNG, trimmed                                                        | Brand asset library                                                                                     |
| `a plus ict/2.png`                   | `branding/aplus-ict-logo-full-light.png`   | Optional light-logo official variation                       | `A Plus ICT full light logo`; `A Plus ICT logo`                        | transparent PNG, trimmed                                                        | Brand asset library                                                                                     |
| `a plus ict/3.png`                   | `branding/aplus-ict-logo.png`              | Header, footer, login/student access branding                | `A Plus ICT logo`; `A Plus ICT`                                        | transparent PNG, trimmed, preserve aspect ratio                                 | `site_profiles.logoResourceId`                                                                          |
| `a plus ict/4.png`                   | `branding/aplus-ict-logo-light.png`        | Optional navy-footer brand variation                         | `A Plus ICT light logo`; `A Plus ICT`                                  | transparent PNG, trimmed                                                        | Brand asset library                                                                                     |
| `a plus ict/3.png`                   | `branding/aplus-ict-icon.png`              | Mobile icon and favicon source                               | `A Plus ICT icon`; `A Plus ICT icon`                                   | transparent PNG, exact crop of the supplied A+ symbol                           | Brand asset library / favicon source                                                                    |
| `images.jfif`                        | `site/home/student-learning-banner.webp`   | Homepage hero/banner                                         | `A Plus ICT student learning banner`; `Student learning with a laptop` | 700 × 394 WebP, 16:9 cover; source is not upscaled                              | `site_profiles.bannerResourceId`                                                                        |
| `images.jfif`                        | `site/og/aplus-ict-social.webp`            | Open Graph/social preview, where server metadata supports it | `A Plus ICT social preview`; `Student learning with a laptop`          | 700 × 368 WebP; source is below the preferred 1200 × 630, so it is not upscaled | Social/OG resource inventory                                                                            |
| `istockphoto-2105091005-612x612.jpg` | `courses/al-ict-sinhala/course-cover.webp` | Sinhala Medium course card and hero                          | `A/L ICT Sinhala Medium cover`; `Student studying ICT with a laptop`   | 612 × 383 WebP, 8:5 cover; source is not upscaled                               | `course_tracks.heroResourceId` for the published Sinhala track (also returned as `thumbnailResourceId`) |
| `istockphoto-1639821021-612x612.jpg` | `courses/al-ict-english/course-cover.webp` | English Medium course card and hero                          | `A/L ICT English Medium cover`; `Student studying ICT with a laptop`   | 612 × 383 WebP, 8:5 cover; source is not upscaled                               | `course_tracks.heroResourceId` for the published English track (also returned as `thumbnailResourceId`) |
| `a plus ict.png`                     | `tutor/aplus-ict-tutor.webp`               | Homepage tutor preview and About page                        | `A Plus ICT tutor portrait`; `A Plus ICT tutor`                        | 800 × 1000 WebP, 4:5 cover, subject-positioned                                  | `site_profiles.tutorResourceId`                                                                         |

## mdev upload target and registration

The configured persistent upload target is the `resource-uploads` Docker volume mounted at:

```text
/app/storage/resources
```

inside the `resource-service` container. Do not use an absolute host path in the database. From the mdev Infra directory, inspect the host-managed path first:

```sh
docker volume inspect resource-uploads
```

Then copy the prepared directory tree into `/app/storage/resources` using your approved container/volume workflow, preserving these exact relative folders:

```text
branding/
site/home/
site/og/
courses/al-ict-sinhala/
courses/al-ict-english/
tutor/
```

Run the following from the Resource Service container or its project directory after copying files. Replace `<administrator-uuid>` with an existing administrator UUID. Each command is idempotent and prints its Resource ID.

```sh
npm run resource:register -- --storage-key branding/aplus-ict-logo.png --title "A Plus ICT logo" --alt-text "A Plus ICT" --access PUBLIC --actor-user-id <administrator-uuid>
npm run resource:register -- --storage-key branding/aplus-ict-icon.png --title "A Plus ICT icon" --alt-text "A Plus ICT icon" --access PUBLIC --actor-user-id <administrator-uuid>
npm run resource:register -- --storage-key site/home/student-learning-banner.webp --title "A Plus ICT student learning banner" --alt-text "Student learning with a laptop" --access PUBLIC --actor-user-id <administrator-uuid>
npm run resource:register -- --storage-key site/og/aplus-ict-social.webp --title "A Plus ICT social preview" --alt-text "Student learning with a laptop" --access PUBLIC --actor-user-id <administrator-uuid>
npm run resource:register -- --storage-key courses/al-ict-sinhala/course-cover.webp --title "A/L ICT Sinhala Medium cover" --alt-text "Student studying ICT with a laptop" --access PUBLIC --actor-user-id <administrator-uuid>
npm run resource:register -- --storage-key courses/al-ict-english/course-cover.webp --title "A/L ICT English Medium cover" --alt-text "Student studying ICT with a laptop" --access PUBLIC --actor-user-id <administrator-uuid>
npm run resource:register -- --storage-key tutor/aplus-ict-tutor.webp --title "A Plus ICT tutor portrait" --alt-text "A Plus ICT tutor" --access PUBLIC --actor-user-id <administrator-uuid>
```

Store the returned UUIDs in Content Service through the approved administration workflow:

| Content assignment                               | Resource ID to use                              |
| ------------------------------------------------ | ----------------------------------------------- |
| Published Sinhala `course_tracks.heroResourceId` | `courses/al-ict-sinhala/course-cover.webp` UUID |
| Published English `course_tracks.heroResourceId` | `courses/al-ict-english/course-cover.webp` UUID |
| Published `site_profiles.logoResourceId`         | `branding/aplus-ict-logo.png` UUID              |
| Published `site_profiles.bannerResourceId`       | `site/home/student-learning-banner.webp` UUID   |
| Published `site_profiles.tutorResourceId`        | `tutor/aplus-ict-tutor.webp` UUID               |

`thumbnailResourceId` is deliberately not stored separately on `course_tracks`: the public catalogue derives it from `heroResourceId`, avoiding duplicate references for the same course image. Do not assign a host path or a raw public URL to any database field.
