using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Sonora.Native.Services
{
    public record SyncedLyric(TimeSpan Time, string Text);

    public class TrackLyrics
    {
        public bool IsSynced { get; set; }
        public List<SyncedLyric> SyncedLines { get; set; } = new();
        public string? PlainText { get; set; }
        public string Source { get; set; } = "online";
    }

    public class OnlineLyricsService
    {
        private static readonly HttpClient _httpClient = new HttpClient();

        public async Task<TrackLyrics?> FetchLyricsAsync(string title, string artist, string? album, double? durationSec)
        {
            try
            {
                var cleanTitle = Regex.Replace(title, @"\([^)]*\)|\[[^\]]*\]", "").Trim();
                var cleanArtist = Regex.Replace(artist, @"feat\..*", "", RegexOptions.IgnoreCase).Trim();

                var query = $"https://lrclib.net/api/get?track_name={Uri.EscapeDataString(cleanTitle)}&artist_name={Uri.EscapeDataString(cleanArtist)}";
                if (!string.IsNullOrEmpty(album))
                {
                    query += $"&album_name={Uri.EscapeDataString(album)}";
                }
                if (durationSec.HasValue && durationSec.Value > 0)
                {
                    query += $"&duration={Math.Round(durationSec.Value)}";
                }

                var response = await _httpClient.GetAsync(query);
                if (!response.IsSuccessStatusCode)
                {
                    // Fallback to search
                    var searchUrl = $"https://lrclib.net/api/search?q={Uri.EscapeDataString($"{cleanTitle} {cleanArtist}")}";
                    response = await _httpClient.GetAsync(searchUrl);
                    if (!response.IsSuccessStatusCode) return null;

                    var searchJson = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(searchJson);
                    if (doc.RootElement.GetArrayLength() == 0) return null;

                    var first = doc.RootElement[0];
                    return ParseFromJson(first);
                }

                var json = await response.Content.ReadAsStringAsync();
                using var singleDoc = JsonDocument.Parse(json);
                return ParseFromJson(singleDoc.RootElement);
            }
            catch
            {
                return null;
            }
        }

        private TrackLyrics ParseFromJson(JsonElement element)
        {
            var result = new TrackLyrics();

            if (element.TryGetProperty("syncedLyrics", out var syncedElem) && !string.IsNullOrWhiteSpace(syncedElem.GetString()))
            {
                var rawLrc = syncedElem.GetString()!;
                result.IsSynced = true;
                result.SyncedLines = ParseLrc(rawLrc);
            }

            if (element.TryGetProperty("plainLyrics", out var plainElem))
            {
                result.PlainText = plainElem.GetString();
            }

            return result;
        }

        public static List<SyncedLyric> ParseLrc(string lrcContent)
        {
            var list = new List<SyncedLyric>();
            var regex = new Regex(@"\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)");
            var lines = lrcContent.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var match = regex.Match(line);
                if (match.Success)
                {
                    int min = int.Parse(match.Groups[1].Value);
                    int sec = int.Parse(match.Groups[2].Value);
                    int ms = 0;
                    if (match.Groups[3].Success)
                    {
                        var msStr = match.Groups[3].Value.PadRight(3, '0').Substring(0, 3);
                        ms = int.Parse(msStr);
                    }

                    var time = new TimeSpan(0, 0, min, sec, ms);
                    var text = match.Groups[4].Value.Trim();
                    if (!string.IsNullOrEmpty(text))
                    {
                        list.Add(new SyncedLyric(time, text));
                    }
                }
            }

            list.Sort((a, b) => a.Time.CompareTo(b.Time));
            return list;
        }
    }
}
