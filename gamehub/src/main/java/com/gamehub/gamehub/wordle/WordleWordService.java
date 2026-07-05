package com.gamehub.gamehub.wordle;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class WordleWordService {

    private List<Word> words;
    private final Random random = new Random();

    @PostConstruct
    public void loadWords() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = new ClassPathResource("wordle-words.json").getInputStream();

        Map<String, List<Word>> data = mapper.readValue(
            is,
            mapper.getTypeFactory().constructMapType(
                Map.class,
                mapper.constructType(String.class),
                mapper.getTypeFactory().constructCollectionType(List.class, Word.class)
            )
        );

        this.words = data.get("words");
    }

    public Word pickRandomWord(String difficulty) {
        List<Word> filtered = words.stream()
            .filter(w -> w.getDifficulty().equalsIgnoreCase(difficulty))
            .toList();
        return filtered.get(random.nextInt(filtered.size()));
    }
}