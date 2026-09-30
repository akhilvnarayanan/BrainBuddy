# BrightSprout source analysis

BrightSprout is a new unified application. The activity rules, copy, visual
system, and UI composition in this project are original. The repositories
below were reviewed for gameplay patterns, interaction ideas, architecture
patterns, and accessibility considerations.

## Reusable ideas selected

| Repository | Useful ideas reviewed | License boundary |
| --- | --- | --- |
| [brain-development-games](https://github.com/sojinantony01/brain-development-games) | A broad cognitive-game catalogue, level progression, local progress, celebration feedback, and focused activities such as pattern matrix, visual search, Simon-style sequences, quick math, and card matching. | No license file was present in the repository snapshot. BrightSprout uses high-level gameplay ideas only; no source, assets, or copy were reused. |
| [Math4Kids](https://github.com/schurick1502/Math4Kids) | Short rounds, grade-aware arithmetic ranges, lives, countdown pacing, instant feedback, and local reward settings. | MIT. Reviewed as an implementation reference; BrightSprout uses an original Number Quest implementation and does not ship copied code or media. |
| [kids-learning-games](https://github.com/tamakiramimy/kids-learning-games) | Map-like exploration, short learning nodes, gentle hints, companion/reward progression, offline-first storage, and touch/controller-friendly interaction. | No project license file was present. Its third-party notice was reviewed separately. No project code or bundled media is reused. |
| [kid-games](https://github.com/cnotv/kid-games) | Simple topic-based entry points for numbers, animals, and alphabet learning, plus a lightweight card-first navigation model. | No license file was present. BrightSprout uses the topic grouping idea only. |
| [react-memory-game](https://github.com/fotisoikonomou/react-memory-game) | Small, understandable memory-game state model, pair matching, move tracking, timer, local best score, and flip/matched states. | No license file was present. BrightSprout's Memory Match logic and visuals are independently implemented. |
| [math-mash](https://github.com/cmmusni/math-mash) | React/Phaser separation, HUD-style score and level feedback, and arcade-like math pacing. | No license file was present. BrightSprout uses a lightweight React activity instead of copying the Phaser implementation. |
| [battlemath](https://github.com/JesseRWeigel/battlemath) | Difficulty bands, operation selection, timed questions, scoring by response speed, sound feedback, tutorial framing, and encouragement copy. | MIT. BrightSprout uses the broad educational pattern only and avoids copying source, characters, sounds, or artwork. |
| [matheor](https://github.com/satraul/matheor) | Turning arithmetic into an action loop by combining numbers and operators to solve a challenge. | MIT. BrightSprout borrows the motivation to make arithmetic feel active, not its Unity implementation or assets. |
| [stepwise](https://github.com/HildoBijl/stepwise) | Skill trees, exercise selection, mastery tracking, input grading, and progress-oriented learning architecture. | MIT. BrightSprout uses a small local skill breakdown rather than importing the platform. |
| [focus-adventure](https://github.com/rahulvelapure/focus-adventure) | Focus, working-memory, inhibition, reaction, and task-switching activity families; quests, streaks, supportive coaching, and privacy-first local progress. | Apache-2.0. BrightSprout uses the child-positive focus framing and short-session principle without copying code or assets. |
| [insertcoin](https://github.com/apratico/insertcoin) | A compact game registry, lazy activity mounting, mobile-first canvas discipline, local stats, PWA thinking, and original-mechanics guidance. | MIT. BrightSprout follows the idea of one unified activity catalogue but contains no imported InsertCoin source or media. |

## Product decisions

- BrightSprout starts with four activities that cover distinct skills:
  Memory Match (working memory), Number Quest (arithmetic fluency), Pattern
  Path (visual sequencing), and Focus Safari (inhibition and visual attention).
- Progress is local-only in the first release. No accounts, ads, social feed, or
  leaderboard are included.
- Feedback is encouraging and specific. A mistake gives a retry or a hint
  path rather than removing progress.
- The interface uses original CSS-built shapes and iconography instead of
  repository artwork, screenshots, sounds, or external image URLs.