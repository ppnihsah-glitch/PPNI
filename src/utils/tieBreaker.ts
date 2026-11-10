import { Participant, JuryScore, RankedParticipant, CategoryType } from '../types';

/**
 * Calculates rankings strictly according to Section C of HSAH Borang Pemarkahan:
 * 1. Primary sort: Total Score (descending)
 * 2. Tie-break step 2: Kekemasan & Kawalan Mewarna (Max 30) (descending)
 * 3. Tie-break step 3: Kreativiti & Keaslian (Max 25) (descending)
 * 4. Tie-break step 4: Kombinasi & Kesesuaian Warna (Max 25) (descending)
 * 5. Tie-break step 5: Persembahan Keseluruhan (Max 20) / Panel discussion note
 */
export function calculateRankings(
  participants: Participant[],
  scores: JuryScore[],
  category: CategoryType
): RankedParticipant[] {
  // Filter participants of this specific category
  const categoryParticipants = participants.filter((p) => p.category === category);

  // Group scores by participantId
  const scoreMap = new Map<string, JuryScore[]>();
  scores
    .filter((s) => s.category === category)
    .forEach((s) => {
      const list = scoreMap.get(s.participantId) || [];
      list.push(s);
      scoreMap.set(s.participantId, list);
    });

  // Calculate averages per participant
  const rankedList: RankedParticipant[] = categoryParticipants
    .filter((p) => scoreMap.has(p.id) && (scoreMap.get(p.id)?.length || 0) > 0)
    .map((p) => {
      const pScores = scoreMap.get(p.id) || [];
      const count = pScores.length;

      const sumTotal = pScores.reduce((acc, curr) => acc + curr.totalScore, 0);
      const sumKekemasan = pScores.reduce((acc, curr) => acc + curr.criteria.kekemasan, 0);
      const sumKreativiti = pScores.reduce((acc, curr) => acc + curr.criteria.kreativiti, 0);
      const sumKombinasi = pScores.reduce((acc, curr) => acc + curr.criteria.kombinasiWarna, 0);
      const sumPersembahan = pScores.reduce((acc, curr) => acc + curr.criteria.persembahan, 0);

      return {
        participantId: p.id,
        category: p.category,
        attended: p.attended,
        name: p.name,
        school: p.school,
        scores: pScores,
        averageTotal: Number((sumTotal / count).toFixed(2)),
        avgKekemasan: Number((sumKekemasan / count).toFixed(2)),
        avgKreativiti: Number((sumKreativiti / count).toFixed(2)),
        avgKombinasi: Number((sumKombinasi / count).toFixed(2)),
        avgPersembahan: Number((sumPersembahan / count).toFixed(2)),
        rank: 0,
      };
    });

  // Sort with tie-breaker logic
  rankedList.sort((a, b) => {
    // 1. Highest total mark
    if (b.averageTotal !== a.averageTotal) {
      return b.averageTotal - a.averageTotal;
    }

    // 2. Tie-break: Kekemasan & Kawalan Mewarna (30 marks)
    if (b.avgKekemasan !== a.avgKekemasan) {
      return b.avgKekemasan - a.avgKekemasan;
    }

    // 3. Tie-break: Kreativiti & Keaslian (25 marks)
    if (b.avgKreativiti !== a.avgKreativiti) {
      return b.avgKreativiti - a.avgKreativiti;
    }

    // 4. Tie-break: Kombinasi & Kesesuaian Warna (25 marks)
    if (b.avgKombinasi !== a.avgKombinasi) {
      return b.avgKombinasi - a.avgKombinasi;
    }

    // 5. Persembahan Keseluruhan
    return b.avgPersembahan - a.avgPersembahan;
  });

  // Assign ranks & annotate tie-breaker if applicable
  rankedList.forEach((item, index) => {
    item.rank = index + 1;
    if (index > 0) {
      const prev = rankedList[index - 1];
      if (prev.averageTotal === item.averageTotal) {
        if (prev.avgKekemasan !== item.avgKekemasan) {
          item.tieBrokenBy = 'Diputuskan oleh Kekemasan (Langkah 2)';
          prev.tieBrokenBy = 'Diputuskan oleh Kekemasan (Langkah 2)';
        } else if (prev.avgKreativiti !== item.avgKreativiti) {
          item.tieBrokenBy = 'Diputuskan oleh Kreativiti (Langkah 3)';
          prev.tieBrokenBy = 'Diputuskan oleh Kreativiti (Langkah 3)';
        } else if (prev.avgKombinasi !== item.avgKombinasi) {
          item.tieBrokenBy = 'Diputuskan oleh Warna (Langkah 4)';
          prev.tieBrokenBy = 'Diputuskan oleh Warna (Langkah 4)';
        } else {
          item.tieBrokenBy = 'Skor Sama Sepenuhnya (Perbincangan Panel)';
        }
      }
    }
  });

  return rankedList;
}
