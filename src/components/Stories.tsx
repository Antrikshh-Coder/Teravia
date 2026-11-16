import React, { useState, useEffect } from 'react';
import { ENVIRONMENTAL_STORIES } from '../data/storiesData';
import { EnvironmentalStory } from '../types';
import {
  TreePine,
  Clock,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  X,
  BookOpen,
  Share2,
  Bookmark,
} from 'lucide-react';

export const Stories: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<EnvironmentalStory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Close reader on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStory(null);
    };
    if (selectedStory) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStory]);

  const categories = [
    'All',
    'Urban Ecology',
    'Conservation',
    'Environmental Physics',
    'Restoration',
    'Field Guide',
  ];

  const filteredStories = ENVIRONMENTAL_STORIES.filter((story) => {
    return selectedCategory === 'All' || story.category === selectedCategory;
  });

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#0E120F] text-[#F4F3EC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Editorial Header */}
        <div className="space-y-2 border-b border-[#25352A] pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#727B5A]">
            <TreePine className="w-4 h-4" />
            <span>TERAVIA Dispatches & Editorial</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-normal tracking-tight text-[#F4F3EC]">
            Environmental Stories
          </h1>
          <p className="text-xs sm:text-sm text-[#777B70] max-w-2xl leading-relaxed">
            In-depth dispatches exploring microclimate thermodynamics, urban biodiversity corridors, and the field ethos of living in tropical nature.
          </p>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#25352A] text-white font-semibold shadow-sm'
                    : 'bg-[#151A16] text-[#AAB29A] hover:bg-[#1C231E] hover:text-white border border-[#25352A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="group rounded-3xl bg-[#151A16] border border-[#25352A] hover:border-[#727B5A] transition-all cursor-pointer overflow-hidden shadow-xl flex flex-col justify-between"
            >
              {/* Cover Image */}
              <div className="relative h-52 w-full bg-[#1C231E] overflow-hidden">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151A16] via-transparent to-black/30" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0E120F]/80 text-[#AAB29A] backdrop-blur-md">
                  {story.category}
                </span>
                <span className="absolute bottom-3 right-3 text-[10px] text-[#F4F3EC] font-medium bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#727B5A]" />
                  {story.readTime}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] text-[#777B70] flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#727B5A]" />
                    <span>{story.publishedDate}</span>
                  </div>
                  <h2 className="text-lg font-medium text-[#F4F3EC] group-hover:text-white transition-colors leading-snug">
                    {story.title}
                  </h2>
                  <p className="text-xs text-[#777B70] line-clamp-3 leading-relaxed">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#25352A]/60 flex items-center justify-between text-xs text-[#AAB29A]">
                  <span className="truncate max-w-[160px] text-[11px]">{story.author}</span>
                  <span className="text-[#727B5A] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold text-[11px]">
                    Read Story <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Full Article Reader Modal ── */}
        {selectedStory && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setSelectedStory(null)}
          >
            <div
              className="w-full max-w-3xl bg-[#151A16] border border-[#25352A] rounded-3xl overflow-hidden shadow-2xl relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Cover */}
              <div className="relative h-64 sm:h-80 w-full bg-[#1C231E]">
                <img
                  src={selectedStory.coverImage}
                  alt={selectedStory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151A16] via-black/40 to-black/30" />
                <button
                  onClick={() => setSelectedStory(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
                  aria-label="Close reader"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#25352A] text-[#AAB29A] border border-[#727B5A]/40 backdrop-blur-md">
                      {selectedStory.category}
                    </span>
                    <span className="text-xs text-[#F4F3EC] bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      {selectedStory.readTime}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-medium text-white tracking-tight leading-snug">
                    {selectedStory.title}
                  </h1>
                </div>
              </div>

              {/* Article Content Body */}
              <div className="p-6 sm:p-10 space-y-6 text-[#F4F3EC]">
                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-[#777B70] pb-4 border-b border-[#25352A]">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#727B5A]" />
                    <span>{selectedStory.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#727B5A]" />
                    <span>{selectedStory.publishedDate}</span>
                  </div>
                </div>

                {/* Subtitle / Abstract */}
                <div className="text-sm sm:text-base font-editorial italic text-[#AAB29A] leading-relaxed border-l-2 border-[#727B5A] pl-4 py-1">
                  {selectedStory.subtitle}
                </div>

                {/* Sections */}
                <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-[#F4F3EC]/90">
                  {selectedStory.content.map((sec, idx) => {
                    if (sec.type === 'heading') {
                      return (
                        <h3
                          key={idx}
                          className="text-base sm:text-lg font-medium text-[#F4F3EC] pt-3 tracking-tight"
                        >
                          {sec.text}
                        </h3>
                      );
                    }
                    if (sec.type === 'quote') {
                      return (
                        <blockquote
                          key={idx}
                          className="p-5 rounded-2xl bg-[#1C231E] border border-[#727B5A]/40 text-sm sm:text-base font-editorial italic text-[#F4F3EC] leading-relaxed my-4"
                        >
                          "{sec.text}"
                        </blockquote>
                      );
                    }
                    if (sec.type === 'callout') {
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-[#25352A]/50 border border-[#727B5A]/40 text-xs sm:text-sm text-[#AAB29A] leading-relaxed my-3 whitespace-pre-line"
                        >
                          {sec.text}
                        </div>
                      );
                    }
                    return <p key={idx}>{sec.text}</p>;
                  })}
                </div>

                {/* Sources & References */}
                <div className="pt-6 border-t border-[#25352A] space-y-3">
                  <h4 className="text-[11px] uppercase tracking-wider text-[#727B5A] font-semibold">
                    Sources & Scientific References
                  </h4>
                  <ul className="space-y-2 text-xs text-[#777B70]">
                    {selectedStory.sources.map((src, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#727B5A] mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="text-[#F4F3EC]">{src.title}</span> —{' '}
                          <span>{src.publisher} ({src.year})</span>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#AAB29A] hover:underline ml-1.5"
                            >
                              <span>Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Close action */}
                <div className="pt-6 border-t border-[#25352A] flex justify-end">
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#41483A] transition-colors"
                  >
                    Done Reading
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
