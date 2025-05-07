
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Understanding Your Menstrual Cycle",
    summary: "Learn about the four phases of your menstrual cycle and how they affect your body.",
    content: `<p class="mb-4">The menstrual cycle is typically divided into four phases:</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">1. Menstrual Phase (Days 1-5)</h3>
    <p class="mb-4">This phase begins on the first day of your period and lasts until the bleeding stops. During this time, the uterine lining sheds through the vagina if pregnancy doesn't occur. You might experience cramps, fatigue, and mood changes.</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">2. Follicular Phase (Days 1-13)</h3>
    <p class="mb-4">This phase overlaps with the menstrual phase, starting on day 1 and lasting until ovulation. The brain releases follicle-stimulating hormone (FSH), stimulating the ovaries to produce follicles containing eggs. One dominant follicle will release an egg during ovulation.</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">3. Ovulation Phase (Day 14)</h3>
    <p class="mb-4">Rising estrogen levels trigger a surge in luteinizing hormone (LH), causing the dominant follicle to release an egg. This typically happens around day 14 in a 28-day cycle. The egg travels through the fallopian tube toward the uterus and can be fertilized during this time.</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">4. Luteal Phase (Days 15-28)</h3>
    <p class="mb-4">After ovulation, the empty follicle transforms into the corpus luteum, which produces progesterone to thicken the uterine lining for potential pregnancy. If fertilization doesn't occur, the corpus luteum degenerates, hormone levels drop, and the uterine lining sheds, beginning a new cycle.</p>
    <p class="mt-4">Understanding these phases can help you recognize patterns in your energy levels, mood, and physical symptoms throughout the month. Track your cycle to identify your unique patterns and plan accordingly.</p>`,
    category: "Cycle Education",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "2",
    title: "Managing PMS Symptoms Naturally",
    summary: "Discover natural remedies and lifestyle changes to help ease premenstrual syndrome.",
    content: `<p class="mb-4">Premenstrual syndrome (PMS) affects many women in the days leading up to their period. Symptoms can include mood swings, tender breasts, food cravings, fatigue, irritability, and depression. Here are some natural ways to manage PMS symptoms:</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Diet Changes</h3>
    <ul class="list-disc pl-5 mb-4">
      <li>Reduce salt intake to minimize bloating</li>
      <li>Avoid caffeine and alcohol, which can affect mood and energy levels</li>
      <li>Eat smaller, more frequent meals to maintain blood sugar levels</li>
      <li>Include calcium-rich foods like yogurt and leafy greens</li>
      <li>Increase magnesium intake through nuts, seeds, and whole grains</li>
    </ul>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Exercise and Sleep</h3>
    <ul class="list-disc pl-5 mb-4">
      <li>Engage in regular physical activity to boost endorphins</li>
      <li>Aim for 30 minutes of moderate exercise most days</li>
      <li>Practice yoga or stretching to reduce cramps and improve mood</li>
      <li>Maintain a consistent sleep schedule</li>
    </ul>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Stress Management</h3>
    <ul class="list-disc pl-5 mb-4">
      <li>Practice deep breathing or meditation</li>
      <li>Try progressive muscle relaxation techniques</li>
      <li>Use aromatherapy with lavender or chamomile</li>
      <li>Consider cognitive behavioral therapy for severe emotional symptoms</li>
    </ul>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Supplements</h3>
    <p class="mb-4">Some women find relief with supplements like calcium, magnesium, vitamin B6, and evening primrose oil. Always consult with a healthcare provider before starting any supplement regimen.</p>
    <p class="mt-4">Remember that what works for one person may not work for another. Track your symptoms and try different approaches to find the best combination for you.</p>`,
    category: "Wellness",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "3",
    title: "Fertility Awareness Methods",
    summary: "Learn about different ways to track your fertility window for family planning.",
    content: `<p class="mb-4">Fertility awareness methods (FAMs) are ways to track your menstrual cycle to determine when you're most likely to get pregnant. These methods can be used for either avoiding pregnancy or trying to conceive. Here are the main types:</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Calendar Method</h3>
    <p class="mb-4">This involves tracking your cycle length over several months to identify your fertile window. It's less reliable than other methods as it doesn't account for cycle variations.</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Basal Body Temperature (BBT) Method</h3>
    <p class="mb-4">Your basal temperature rises slightly (0.2-0.5°F) after ovulation. Taking your temperature each morning before getting out of bed can help identify when ovulation has occurred. This method is more effective for confirming ovulation than predicting it.</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Cervical Mucus Method</h3>
    <p class="mb-4">This involves checking your cervical mucus daily. As you approach ovulation, mucus becomes clearer, slippery, and stretchy (similar to egg whites), indicating your fertile days.</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Sympto-Thermal Method</h3>
    <p class="mb-4">This combines BBT, cervical mucus observations, and sometimes other fertility signs like cervical position and secondary symptoms (breast tenderness, mittelschmerz). It's more effective than using any single method alone.</p>
    <h3 class="text-lg font-semibold mb-2 text-femme-burgundy">Ovulation Predictor Kits</h3>
    <p class="mb-4">These detect the luteinizing hormone (LH) surge that occurs 24-36 hours before ovulation. They're convenient but can be expensive for long-term use.</p>
    <p class="mt-4">For greatest effectiveness, many women combine multiple methods and work with a trained FAM educator. Remember that FAMs require consistent daily practice and careful record-keeping.</p>`,
    category: "Fertility",
    imageUrl: "https://images.unsplash.com/photo-1526662092594-e98c1e356d6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
  },
];

const HealthInsights: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Set a featured article on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * articles.length);
    setFeaturedArticle(articles[randomIndex]);
  }, []);

  const categories = ["All", ...Array.from(new Set(articles.map(article => article.category)))];

  const filteredArticles = selectedCategory === "All" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsOpen(true);
  };

  return (
    <Card className="shadow-lg border-femme-taupe border-opacity-50">
      <CardHeader>
        <CardTitle className="text-femme-burgundy flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-femme-pink" />
          Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featuredArticle && (
            <div 
              className="rounded-lg overflow-hidden relative h-40 bg-cover bg-center mb-4"
              style={{
                backgroundImage: featuredArticle.imageUrl
                  ? `url(${featuredArticle.imageUrl})`
                  : `linear-gradient(135deg, #fad7e7 0%, #e9c2d0 100%)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                <div className="text-white">
                  <div className="text-xs bg-femme-pink/80 inline-block px-2 py-1 rounded mb-2">
                    {featuredArticle.category}
                  </div>
                  <h3 className="font-medium text-lg">{featuredArticle.title}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openArticle(featuredArticle)}
                    className="text-white px-0 hover:bg-transparent hover:text-femme-pink mt-1"
                  >
                    Read More <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex overflow-x-auto gap-2 pb-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={selectedCategory === category 
                  ? "bg-femme-pink hover:bg-femme-pink/90"
                  : "text-femme-burgundy"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <Accordion type="single" collapsible className="w-full">
            {filteredArticles.map(article => (
              <AccordionItem key={article.id} value={article.id}>
                <AccordionTrigger className="hover:text-femme-burgundy">
                  {article.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-femme-burgundy/70 mb-2">
                    {article.summary}
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => openArticle(article)}
                    className="bg-femme-pink hover:bg-femme-pink/90"
                  >
                    Read Full Article
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent className="w-full md:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-femme-burgundy">
                {selectedArticle?.title}
              </SheetTitle>
            </SheetHeader>
            {selectedArticle && (
              <div className="mt-4">
                {selectedArticle.imageUrl && (
                  <div 
                    className="w-full h-48 bg-cover bg-center rounded-lg mb-4"
                    style={{ backgroundImage: `url(${selectedArticle.imageUrl})` }}
                  />
                )}
                <div 
                  className="prose max-w-none text-femme-burgundy/90"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};

export default HealthInsights;
