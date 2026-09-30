using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Sonora.Native.Services
{
    public class LocalTrackItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FilePath { get; set; } = "";
        public string Title { get; set; } = "";
        public string Artist { get; set; } = "";
        public string Album { get; set; } = "";
        public TimeSpan Duration { get; set; }
        public int Bitrate { get; set; }
        public int SampleRate { get; set; }
        public int BitsPerSample { get; set; }
        public bool IsHiResLossless => SampleRate >= 88200 || BitsPerSample >= 24;
        public string? ArtworkPath { get; set; }
    }

    public class LocalLibraryService
    {
        private static readonly string[] SupportedExtensions = { ".flac", ".alac", ".wav", ".mp3", ".m4a", ".aac" };

        public async Task<List<LocalTrackItem>> ScanFolderAsync(string folderPath)
        {
            var tracks = new List<LocalTrackItem>();

            await Task.Run(() =>
            {
                if (!Directory.Exists(folderPath)) return;

                var files = Directory.EnumerateFiles(folderPath, "*.*", SearchOption.AllDirectories)
                    .Where(f => SupportedExtensions.Contains(Path.GetExtension(f).ToLowerInvariant()));

                foreach (var file in files)
                {
                    try
                    {
                        using var tagFile = TagLib.File.Create(file);
                        var item = new LocalTrackItem
                        {
                            FilePath = file,
                            Title = !string.IsNullOrWhiteSpace(tagFile.Tag.Title) ? tagFile.Tag.Title : Path.GetFileNameWithoutExtension(file),
                            Artist = !string.IsNullOrWhiteSpace(tagFile.Tag.FirstPerformer) ? tagFile.Tag.FirstPerformer : "Unknown Artist",
                            Album = !string.IsNullOrWhiteSpace(tagFile.Tag.Album) ? tagFile.Tag.Album : "Local Audio",
                            Duration = tagFile.Properties.Duration,
                            Bitrate = tagFile.Properties.AudioBitrate,
                            SampleRate = tagFile.Properties.AudioSampleRate,
                            BitsPerSample = tagFile.Properties.BitsPerSample > 0 ? tagFile.Properties.BitsPerSample : 16,
                        };

                        tracks.Add(item);
                    }
                    catch
                    {
                        // File corrupted or locked
                    }
                }
            });

            return tracks;
        }
    }
}
