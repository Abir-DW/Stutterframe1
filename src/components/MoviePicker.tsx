import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Star,
  User,
  Clapperboard,
  Video,
  Tag,
  Tv,
  Play,
  MonitorPlay,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { MovieRecommendation, GroundingSource, WatchOption } from '../types';
import { ResearchingIndicator, ErrorState } from './ResearchingIndicator';
import { fetchWithAuth } from '../utils/api';

export const MoviePicker: React.FC = () => {
  const [selectedGenrePreset, setSelectedGenrePreset] = useState('Psychological Thriller');
  const [customGenre, setCustomGenre] = useState('');
  const [language, setLanguage] = useState('Any');
  const [era, setEra] = useState('1970s (New Hollywood)');
  const [mood, setMood] = useState('Any mood');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState<number | null>(null);
  const [movie, setMovie] = useState<MovieRecommendation | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [previousTitles, setPreviousTitles] = useState<string[]>([]);
  const [posterImgFailed, setPosterImgFailed] = useState(false);

  // Extensive preset catalog of cinematic genres
  const genreOptions = [
    'Film Noir & Hardboiled Detective',
    'Neo-Noir & Tech-Noir',
    'Psychological Thriller & Suspense',
    'Sci-Fi Cyberpunk & Dystopia',
    'French New Wave (Nouvelle Vague)',
    'Italian Neorealism',
    'German Expressionism',
    'Giallo & Italian Mystery Horror',
    'Folk Horror & Pagan Dread',
    'Body Horror & Visceral Sci-Fi',
    'Spaghetti Western & Acid Western',
    'Cosmic Horror & Lovecraftian',
    'Surrealist & Avant-Garde',
    'Slow Cinema & Contemplative Art',
    'Coming-of-Age & Mumblecore',
    'Biopic & Historical Drama',
    'Action Cinema & Kinetic Martial Arts',
    'Dark Satire & Black Comedy',
    'Erotic Thriller & Melodrama',
    'Cinema du Look & French Extremity',
    'Space Opera & Hard Sci-Fi',
    'Supernatural & Haunted Chamber',
    'Crime Epic & Heist Thriller',
    'Anime & Animated Adult Drama',
    'Whodunit & Locked Room Mystery',
    'Cinema Verite & Documentary',
    'Post-Apocalyptic Survival',
    'Psychological Horror & Chamber Piece',
    'Magical Realism & Poetic Cinema',
    'Other (Type Custom Genre)',
  ];

  const eraPresets = [
    'Any Era',
    '1920s-1930s (Early Sound & Silent)',
    '1940s (Golden Age & Classic Noir)',
    '1950s-1960s (Post-War Modernism & New Wave)',
    '1970s (New Hollywood Golden Decade)',
    '1980s (Synth, Arthouse & Neo-Noir)',
    '1990s (Indie Film Revolution)',
    '2000s (Digital Dawn & International Auteurs)',
    '2010s (Modern High-Concept)',
    '2020s (Contemporary Cinema)',
  ];

  const moodPresets = [
    'Any mood',
    'Paranoiac & Gripping',
    'Atmospheric & Meditative',
    'Melancholic & Poetic',
    'Visceral & Kinetic',
    'Darkly Comic & Sardonic',
    'Dreamlike & Uncanny',
    'Quietly Devastating',
    'Tense & Claustrophobic',
    'Euphoric & Sensory',
    'Hypnotic & Haunting',
  ];

  const languagePresets = [
    'Any',
    'English',
    'French',
    'Japanese',
    'Korean',
    'Hindi',
    'Italian',
    'Spanish',
    'German',
    'Russian',
    'Scandinavian (Swedish/Danish/Norwegian)',
    'Mandarin / Cantonese',
    'Portuguese',
    'Bengali',
  ];

  const activeGenre =
    selectedGenrePreset === 'Other (Type Custom Genre)'
      ? customGenre.trim() || 'Cinema'
      : selectedGenrePreset;

  const handleSearch = async (excludeCurrent = false) => {
    setLoading(true);
    setError(null);
    setRetryDelaySeconds(null);
    setPosterImgFailed(false);

    try {
      const excludes = excludeCurrent && movie ? [...previousTitles, movie.title] : previousTitles;

      const res = await fetchWithAuth('/api/movie-picker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: activeGenre,
          language,
          era,
          mood,
          excludeTitles: excludes,
        }),
      });

      if (!res.ok) {
        let errMessage = '';
        try {
          const errData = await res.json();
          const delay = errData.retryDelaySeconds || (res.status === 429 ? 15 : null);
          setRetryDelaySeconds(delay);
          errMessage = errData.error || errData.message;
        } catch {
          const raw = await res.text().catch(() => '');
          errMessage = raw ? `Server returned: ${raw.slice(0, 180)}` : `Request failed with HTTP status ${res.status}`;
        }
        throw new Error(errMessage || `Failed to research movie recommendation (${res.status}).`);
      }

      const data = await res.json();
      setMovie(data.movie);
      setSources(data.sources || []);
      setSearchQueries(data.searchQueries || []);

      if (data.movie?.title) {
        setPreviousTitles((prev) =>
          prev.includes(data.movie.title) ? prev : [...prev, data.movie.title]
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error researching movie.');
    } finally {
      setLoading(false);
    }
  };

  // Default fallback watch options generated from title
  const watchLinks: WatchOption[] =
    movie?.watchLinks && movie.watchLinks.length > 0
      ? movie.watchLinks
      : movie?.title
      ? [
          {
            platform: 'JustWatch',
            url: `https://www.justwatch.com/in/search?q=${encodeURIComponent(movie.title)}`,
            type: 'search',
            badge: 'Streaming & Rent Availability',
          },
          {
            platform: 'YouTube & Google TV',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' movie buy rent')}`,
            type: 'rent',
            badge: 'Rent / Buy Full Movie',
          },
          {
            platform: 'Letterboxd',
            url: `https://letterboxd.com/search/${encodeURIComponent(movie.title)}/`,
            type: 'search',
            badge: 'Reviews, Cast & Stream Info',
          },
          {
            platform: 'IMDb',
            url: `https://www.imdb.com/find/?q=${encodeURIComponent(movie.title)}&s=tt`,
            type: 'search',
            badge: 'Official Catalog & Trivia',
          },
        ]
      : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest mb-2">
          <Film className="w-4 h-4" />
          Live Search-Grounded Archival Film Curator
        </div>
        <h2 className="font-courier text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          THE MOVIE PICKER
        </h2>
        <p className="text-zinc-400 text-sm mt-1 max-w-2xl font-mono">
          Explore curated cinematic discoveries filtered by deep subgenres, world cinema origins, decades, and psychological moods. Verified against real film archives with where-to-watch streaming links.
        </p>
      </div>

      {/* Input controls form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 mb-8 backdrop-blur-sm shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Genre Dropdown with extensive presets + Custom Option */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Film Genre & Movement
            </label>
            <select
              value={selectedGenrePreset}
              onChange={(e) => setSelectedGenrePreset(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
            >
              {genreOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Custom Genre text input appears when "Other" is chosen */}
            {selectedGenrePreset === 'Other (Type Custom Genre)' && (
              <div className="mt-2 animate-fadeIn">
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Type your niche genre (e.g. Acid Western, Cyber-Thriller)..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-amber-500/60 focus:border-amber-400 text-amber-300 text-xs font-mono outline-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Language / Origin */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Language / Origin
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
            >
              {languagePresets.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Era */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Cinematic Era
            </label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
            >
              {eraPresets.map((er) => (
                <option key={er} value={er}>
                  {er}
                </option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Emotional Mood
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white text-xs font-mono outline-none cursor-pointer"
            >
              {moodPresets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            onClick={() => handleSearch(false)}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold font-mono tracking-wider text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 disabled:opacity-50 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-black" />
            {loading ? 'Consulting Live Search Grounding...' : 'Curate Authentic Film Recommendation'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <ResearchingIndicator
          toolName="Movie Picker"
          customMessages={[
            `Searching live Google indexes for ${activeGenre} from ${era}...`,
            'Filtering real-world titles, verified casts, and historical reviews...',
            'Extracting IMDb ratings, cinematographic signatures, and poster art...',
            'Identifying where-to-watch streaming platforms and rental listings...',
          ]}
        />
      )}

      {/* Error state with automatic countdown cooldown */}
      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={() => handleSearch(false)}
          toolName="Movie Picker"
          retryDelaySeconds={retryDelaySeconds}
        />
      )}

      {/* Result Display Card */}
      {movie && !loading && !error && (
        <div className="rounded-2xl bg-zinc-950 border border-amber-500/30 overflow-hidden shadow-2xl relative animate-fadeIn">
          {/* Subtle top film tape header */}
          <div className="bg-[#121216] px-6 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Clapperboard className="w-3.5 h-3.5" />
              VERIFIED ARCHIVAL MATCH
            </span>
            <span className="text-zinc-400">{movie.year || 'Classic Feature'}</span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster / Stylised Film Poster Placeholder */}
            <div className="md:col-span-5 lg:col-span-4 w-full flex flex-col items-center">
              <div className="w-full max-w-[280px] aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-b from-zinc-900 to-black border-2 border-amber-500/40 shadow-2xl relative group flex flex-col justify-between p-4">
                {movie.posterUrl && !posterImgFailed ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={() => setPosterImgFailed(true)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  /* Stylised vintage 35mm film card placeholder */
                  <div className="absolute inset-0 p-5 flex flex-col justify-between bg-[#111115] border border-amber-900/40">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                        STUTTERFRAME ARCHIVE
                      </span>
                      <Film className="w-4 h-4 text-amber-500/60" />
                    </div>

                    <div className="my-auto text-center py-4">
                      <h4 className="font-courier text-xl font-bold text-white leading-tight">
                        {movie.title}
                      </h4>
                      <p className="text-amber-400 text-xs font-mono mt-1">({movie.year})</p>
                      <div className="w-12 h-0.5 bg-amber-500/50 mx-auto my-3"></div>
                      <p className="text-zinc-400 text-[11px] font-mono italic">
                        Directed by {movie.director}
                      </p>
                    </div>

                    <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>35MM CELLULOID</span>
                      <span>{movie.runtime || 'FEATURE FILM'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct image link if available */}
              {movie.posterUrl && !posterImgFailed && (
                <a
                  href={movie.posterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[10px] font-mono text-zinc-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  View Original Poster Art
                </a>
              )}

              {/* "Pick Another" re-roll button */}
              <button
                onClick={() => handleSearch(true)}
                disabled={loading}
                className="mt-4 w-full max-w-[280px] py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Pick Another ({previousTitles.length} seen)
              </button>
            </div>

            {/* Details Column */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-courier text-2xl sm:text-3xl font-bold text-white">
                    {movie.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono">
                    {movie.year}
                  </span>
                  {movie.runtime && (
                    <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono">
                      {movie.runtime}
                    </span>
                  )}
                </div>

                {/* Rating badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-4">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>IMDb: {movie.imdbRating}</span>
                  <span className="text-[10px] text-zinc-500 border-l border-amber-500/20 pl-1.5">
                    Researched live via Google Search
                  </span>
                </div>
              </div>

              {/* 2-3 Line Description */}
              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-sans">
                {movie.description}
              </p>

              {/* Why It Fits */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 font-mono">
                <span className="font-bold text-amber-400 block mb-1">
                  FILMMAKER'S PERSPECTIVE:
                </span>
                {movie.whyItFits}
              </div>

              {/* Cinematographic Signature */}
              {movie.cinematographicStyle && (
                <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300">
                  <span className="text-zinc-500 uppercase tracking-wider block mb-0.5">
                    Cinematographic Aesthetic:
                  </span>
                  {movie.cinematographicStyle}
                </div>
              )}

              {/* Director & Cinematographer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-zinc-500">Director:</span>
                  <span className="text-white font-medium">{movie.director}</span>
                </div>
                {movie.cinematographer && (
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-zinc-500">Cinematography:</span>
                    <span className="text-white font-medium">{movie.cinematographer}</span>
                  </div>
                )}
              </div>

              {/* Main Cast */}
              {movie.mainCast && movie.mainCast.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1.5">
                    Key Cast
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.mainCast.map((actor, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Genre Tags */}
              {movie.genreTags && movie.genreTags.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1.5">
                    Genre Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.genreTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-mono border border-amber-500/20"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* WHERE TO WATCH & STREAM HYPERLINKS (Requested by User) */}
              <div className="mt-4 p-4 rounded-xl bg-zinc-900/90 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider font-bold">
                    <Tv className="w-4 h-4" />
                    Where to Watch & Stream
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Live Platform Search Links
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {watchLinks.map((option, idx) => (
                    <a
                      key={idx}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/50 flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="font-mono text-xs font-bold text-white group-hover:text-amber-300 block">
                            {option.platform}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {option.badge || 'Find movie online'}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Search Grounding Citations */}
              {sources && sources.length > 0 && (
                <div className="mt-2 pt-3 border-t border-zinc-800/80">
                  <span className="text-[11px] font-mono text-zinc-500 block mb-2">
                    Verified Google Search Citations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-amber-400 border border-zinc-700 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                        <span className="max-w-[200px] truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
