import { Feather } from '@expo/vector-icons';
import {useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';

import { contentWidthStyle, Pill, ScreenHeader, SectionLabel, ToolNote } from '@/components/ui';
import { buildQuiz, QUIZ_TOPICS, type QuizQuestion, type QuizTopic } from '@/data/quizBank';
import { useSettings } from '@/store/settings';
import {  font, radii } from '@/theme/tokens';

type Phase = 'setup' | 'play' | 'result';

export default function QuizScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const locale = useSettings((state) => state.locale);
  const [phase, setPhase] = useState<Phase>('setup');
  const [count, setCount] = useState(10);
  const [topics, setTopics] = useState<QuizTopic[]>([...QUIZ_TOPICS]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ question: QuizQuestion; choice: string; correct: boolean }[]>([]);

  const question = questions[index];
  const correctCount = answers.filter((answer) => answer.correct).length;

  const start = () => {
    setQuestions(buildQuiz(count, topics, locale));
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setPhase('play');
  };

  const choose = (choice: string) => {
    if (selected || !question) return;
    setSelected(choice);
    setAnswers((current) => [...current, { question, choice, correct: choice === question.answer }]);
  };

  const next = () => {
    setSelected(null);
    if (index === questions.length - 1) setPhase('result');
    else setIndex((current) => current + 1);
  };

  const toggleTopic = (topic: QuizTopic) => {
    setTopics((current) =>
      current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic],
    );
  };

  if (phase === 'setup') {
    return (
      <View style={[styles.screen, contentWidthStyle]}>
        <ScreenHeader eyebrow={t('app.quiz.eyebrow')} title={t('app.quiz.title')} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.introCard}>
            <Feather name="zap" size={20} color={colors.salmon} />
            <Text style={styles.introText}>{t('app.quiz.intro')}</Text>
          </View>

          <View style={styles.block}>
            <SectionLabel>{t('app.quiz.count')}</SectionLabel>
            <View style={styles.countRow}>
              {[10, 20, 30].map((value) => (
                <Pill
                  key={value}
                  label={String(value)}
                  active={count === value}
                  onPress={() => setCount(value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <SectionLabel>{t('app.quiz.domains')}</SectionLabel>
            <View style={styles.topicGrid}>
              {QUIZ_TOPICS.map((topic) => (
                <Pill
                  key={topic}
                  label={t(`app.quiz.topics.${topic}`)}
                  active={topics.includes(topic)}
                  onPress={() => toggleTopic(topic)}
                />
              ))}
            </View>
          </View>

          <ToolNote label={t('app.common.how')}>{t('app.quiz.how')}</ToolNote>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('app.quiz.start')}
            onPress={start}
            disabled={topics.length === 0}
            style={[styles.primary, topics.length === 0 && styles.primaryDisabled]}
          >
            <Text style={styles.primaryText}>{t('app.quiz.start')} · {count}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'result') {
    return (
      <View style={[styles.screen, contentWidthStyle]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.playHead}>
            <SectionLabel>{t('app.quiz.result')}</SectionLabel>
            <Pressable accessibilityRole="button" accessibilityLabel={t('app.quiz.newGame')} hitSlop={8} onPress={start}>
              <Feather name="rotate-ccw" size={18} color={colors.inkSoft} />
            </Pressable>
          </View>
          <Text style={styles.title}>{t('app.quiz.finished')}</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{correctCount}/{questions.length}</Text>
            <Text style={styles.scoreLabel}>{t('app.quiz.good')}</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreFill, { width: `${(correctCount / questions.length) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.recap}>
            <SectionLabel>{t('app.quiz.detail')}</SectionLabel>
            {answers.map((answer, position) => (
              <View key={answer.question.id} style={styles.recapRow}>
                <View style={[styles.recapDot, { backgroundColor: answer.correct ? colors.accent : colors.lineStrong }]} />
                <Text style={styles.recapIndex}>{String(position + 1).padStart(2, '0')}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recapTopic}>{t(`app.quiz.topics.${answer.question.topic}`)}</Text>
                  <Text style={styles.recapPrompt} numberOfLines={1}>{answer.question.prompt}</Text>
                </View>
                <Text style={[styles.recapMark, { color: answer.correct ? colors.accent : colors.inkSoft }]}>
                  {answer.correct ? '✓' : '✕'}
                </Text>
              </View>
            ))}
          </View>

          <Pressable accessibilityRole="button" onPress={() => setPhase('setup')} style={styles.secondary}>
            <Text style={styles.secondaryText}>{t('app.quiz.settings')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, contentWidthStyle]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.playHead}>
          <SectionLabel>{question?.topic.toUpperCase() ?? 'QUIZ'}</SectionLabel>
          <Text style={styles.counter}>
            {String(index + 1).padStart(2, '0')} / {questions.length}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} />
        </View>

        <Text style={styles.prompt}>{question?.prompt}</Text>

        <View style={styles.options}>
          {question?.options.map((option) => {
            const isAnswer = option === question.answer;
            const isWrong = selected === option && !isAnswer;
            const state = selected
              ? isAnswer ? styles.optionCorrect : isWrong ? styles.optionWrong : styles.optionDim
              : null;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: selected === option }}
                accessibilityLabel={`${t('app.quiz.answer')} ${option}`}
                hitSlop={4}
                onPress={() => choose(option)}
                style={[styles.option, state]}
              >
                <Text style={[styles.optionText, isAnswer && selected && styles.optionTextActive]}>
                  {option}
                </Text>
                {selected && isAnswer && <Feather name="check" size={17} color={colors.paper} />}
                {isWrong && <Feather name="x" size={17} color={colors.accent} />}
              </Pressable>
            );
          })}
        </View>

        {selected && question && (
          <View style={styles.explanation}>
            <SectionLabel>{selected === question.answer ? t('app.quiz.correct') : t('app.quiz.explanation')}</SectionLabel>
            <Text style={styles.explanationText}>{question.explanation}</Text>
            <Pressable accessibilityRole="button" onPress={next} style={styles.primary}>
              <Text style={styles.primaryText}>
                {index === questions.length - 1 ? t('app.quiz.seeResult') : t('app.quiz.next')}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  introCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 8 },
  introText: { flex: 1, fontFamily: font.display, fontSize: 13, color: colors.lineStrong, lineHeight: 20 },
  block: { marginTop: 24 },
  countRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  primary: { marginTop: 24, height: 52, backgroundColor: colors.accent, borderRadius: radii.control, alignItems: 'center', justifyContent: 'center' },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { fontFamily: font.displayBold, fontSize: 16, color: '#FFFFFF' },
  secondary: { marginTop: 16, height: 48, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: radii.control, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: font.display, fontSize: 14, color: colors.ink },
  playHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  counter: { fontFamily: font.mono, fontSize: 12, color: colors.inkSoft },
  progressTrack: { height: 4, backgroundColor: colors.line, borderRadius: 2, marginTop: 12 },
  progressFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  prompt: { fontFamily: font.displayBold, fontSize: 26, color: colors.ink, lineHeight: 32, marginTop: 28 },
  options: { gap: 10, marginTop: 24 },
  option: {
    minHeight: 58, borderRadius: radii.control, borderWidth: 1, borderColor: colors.lineStrong,
    backgroundColor: colors.paperLight, paddingHorizontal: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  optionText: { fontFamily: font.display, fontSize: 16, color: colors.ink },
  optionTextActive: { color: colors.onCard, fontFamily: font.displayBold },
  optionCorrect: { backgroundColor: colors.card, borderColor: colors.card },
  optionWrong: { borderColor: colors.accent },
  optionDim: { opacity: 0.45 },
  explanation: { marginTop: 24, borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 14 },
  explanationText: { fontFamily: font.display, fontSize: 14, color: colors.inkSoft, lineHeight: 21, marginTop: 8 },
  title: { fontFamily: font.displayBold, fontSize: 30, letterSpacing: -0.6, color: colors.ink, marginTop: 6 },
  scoreCard: { marginTop: 20, backgroundColor: colors.card, borderRadius: 14, padding: 20 },
  scoreValue: { fontFamily: font.displayBold, fontSize: 48, color: colors.paper },
  scoreLabel: { fontFamily: font.mono, fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  scoreBar: { height: 6, backgroundColor: colors.line, borderRadius: 3, marginTop: 18 },
  scoreFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  recap: { marginTop: 26 },
  recapRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.line },
  recapDot: { width: 7, height: 7, borderRadius: 4 },
  recapIndex: { fontFamily: font.mono, fontSize: 11, color: colors.inkSoft },
  recapTopic: { fontFamily: font.mono, fontSize: 10, color: colors.inkSoft },
  recapPrompt: { fontFamily: font.display, fontSize: 13, color: colors.ink, marginTop: 2 },
  recapMark: { fontFamily: font.displayBold, fontSize: 16 },
});
