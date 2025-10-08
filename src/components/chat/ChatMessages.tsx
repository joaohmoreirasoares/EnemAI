import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
  selectedAgent: string;
  isGenerating: boolean;
  generatedResponse: string;
}

const ChatMessages = ({ 
  messages, 
  selectedAgent, 
  isGenerating, 
  generatedResponse 
}: ChatMessagesProps) => {
  // Process message content to remove thinking tags and fix markdown
  const processMessageContent = (content: string) => {
    // Remove thinking tags
    let processedContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    
    // Fix common markdown formatting issues
    processedContent = processedContent
      .replace(/\\boxed\{([^}]+)\}/g, '$1') // Remove \boxed wrapper
      .replace(/\\,/g, ',') // Fix escaped commas
      .replace(/\\cdot/g, '·') // Fix multiplication dots
      .replace(/\\qquad/g, ' ') // Fix spacing
      .replace(/\\displaystyle/g, '') // Remove displaystyle
      .replace(/\\left\(/g, '(') // Fix left parentheses
      .replace(/\\right\)/g, ')') // Fix right parentheses
      .replace(/\\le/g, '≤') // Fix less than or equal
      .replace(/\\ge/g, '≥') // Fix greater than or equal
      .replace(/\\infty/g, '∞') // Fix infinity symbol
      .replace(/\\mathbb\{C\}/g, 'ℂ') // Fix complex numbers symbol
      .replace(/\\mathbb\{R\}/g, 'ℝ') // Fix real numbers symbol
      .replace(/\\partial/g, '∂') // Fix partial derivative symbol
      .replace(/\\nabla/g, '∇') // Fix nabla symbol
      .replace(/\\Delta/g, 'Δ') // Fix delta symbol
      .replace(/\\int/g, '∫') // Fix integral symbol
      .replace(/\\sum/g, '∑') // Fix summation symbol
      .replace(/\\in/g, '∈') // Fix element of symbol
      .replace(/\\rightarrow/g, '→') // Fix right arrow
      .replace(/\\leftrightarrow/g, '↔') // Fix left-right arrow
      .replace(/\\times/g, '×') // Fix multiplication symbol
      .replace(/\\div/g, '÷') // Fix division symbol
      .replace(/\\pm/g, '±') // Fix plus-minus symbol
      .replace(/\\mp/g, '∓') // Fix minus-plus symbol
      .replace(/\\neq/g, '≠') // Fix not equal symbol
      .replace(/\\approx/g, '≈') // Fix approximately equal symbol
      .replace(/\\equiv/g, '≡') // Fix equivalent symbol
      .replace(/\\propto/g, '∝') // Fix proportional to symbol
      .replace(/\\infty/g, '∞') // Fix infinity symbol
      .replace(/\\emptyset/g, '∅') // Fix empty set symbol
      .replace(/\\forall/g, '∀') // Fix for all symbol
      .replace(/\\exists/g, '∃') // Fix exists symbol
      .replace(/\\nexists/g, '∄') // Fix not exists symbol
      .replace(/\\in/g, '∈') // Fix element of symbol
      .replace(/\\notin/g, '∉') // Fix not element of symbol
      .replace(/\\subset/g, '⊂') // Fix subset symbol
      .replace(/\\subseteq/g, '⊆') // Fix subset or equal symbol
      .replace(/\\supset/g, '⊃') // Fix superset symbol
      .replace(/\\supseteq/g, '⊇') // Fix superset or equal symbol
      .replace(/\\cup/g, '∪') // Fix union symbol
      .replace(/\\cap/g, '∩') // Fix intersection symbol
      .replace(/\\setminus/g, '∖') // Fix set minus symbol
      .replace(/\\land/g, '∧') // Fix logical and symbol
      .replace(/\\lor/g, '∨') // Fix logical or symbol
      .replace(/\\lnot/g, '¬') // Fix logical not symbol
      .replace(/\\Rightarrow/g, '⇒') // Fix implies symbol
      .replace(/\\Leftrightarrow/g, '⇔') // Fix iff symbol
      .replace(/\\mapsto/g, '↦') // Fix maps to symbol
      .replace(/\\to/g, '→') // Fix to symbol
      .replace(/\\gets/g, '←') // Fix gets symbol
      .replace(/\\uparrow/g, '↑') // Fix up arrow symbol
      .replace(/\\downarrow/g, '↓') // Fix down arrow symbol
      .replace(/\\updownarrow/g, '↕') // Fix up down arrow symbol
      .replace(/\\langle/g, '⟨') // Fix left angle bracket
      .replace(/\\rangle/g, '⟩') // Fix right angle bracket
      .replace(/\\lfloor/g, '⌊') // Fix left floor symbol
      .replace(/\\rfloor/g, '⌋') // Fix right floor symbol
      .replace(/\\lceil/g, '⌈') // Fix left ceiling symbol
      .replace(/\\rceil/g, '⌉') // Fix right ceiling symbol
      .replace(/\\vert/g, '|') // Fix vertical bar
      .replace(/\\Vert/g, '‖') // Fix double vertical bar
      .replace(/\\mid/g, '∣') // Fix divides symbol
      .replace(/\\nmid/g, '∤') // Fix does not divide symbol
      .replace(/\\parallel/g, '∥') // Fix parallel symbol
      .replace(/\\nparallel/g, '∦') // Fix not parallel symbol
      .replace(/\\perp/g, '⊥') // Fix perpendicular symbol
      .replace(/\\angle/g, '∠') // Fix angle symbol
      .replace(/\\triangle/g, '△') // Fix triangle symbol
      .replace(/\\square/g, '□') // Fix square symbol
      .replace(/\\circ/g, '∘') // Fix circle symbol
      .replace(/\\bullet/g, '•') // Fix bullet symbol
      .replace(/\\star/g, '⋆') // Fix star symbol
      .replace(/\\diamond/g, '⋄') // Fix diamond symbol
      .replace(/\\ast/g, '∗') // Fix asterisk symbol
      .replace(/\\oplus/g, '⊕') // Fix circled plus symbol
      .replace(/\\ominus/g, '⊖') // Fix circled minus symbol
      .replace(/\\otimes/g, '⊗') // Fix circled times symbol
      .replace(/\\oslash/g, '⊘') // Fix circled slash symbol
      .replace(/\\odot/g, '⊙') // Fix circled dot symbol
      .replace(/\\dagger/g, '†') // Fix dagger symbol
      .replace(/\\ddagger/g, '‡') // Fix double dagger symbol
      .replace(/\\S/g, '§') // Fix section symbol
      .replace(/\\P/g, '¶') // Fix paragraph symbol
      .replace(/\\copyright/g, '©') // Fix copyright symbol
      .replace(/\\textregistered/g, '®') // Fix registered symbol
      .replace(/\\texttrademark/g, '™') // Fix trademark symbol
      .replace(/\\pounds/g, '£') // Fix pound symbol
      .replace(/\\euro/g, '€') // Fix euro symbol
      .replace(/\\yen/g, '¥') // Fix yen symbol
      .replace(/\\cent/g, '¢') // Fix cent symbol
      .replace(/\\degree/g, '°') // Fix degree symbol
      .replace(/\\prime/g, '′') // Fix prime symbol
      .replace(/\\second/g, '″') // Fix second symbol
      .replace(/\\third/g, '‴') // Fix third symbol
      .replace(/\\ell/g, 'ℓ') // Fix script l symbol
      .replace(/\\wp/g, '℘') // Fix Weierstrass p symbol
      .replace(/\\Re/g, 'ℜ') // Fix real part symbol
      .replace(/\\Im/g, 'ℑ') // Fix imaginary part symbol
      .replace(/\\aleph/g, 'ℵ') // Fix aleph symbol
      .replace(/\\beth/g, 'ℶ') // Fix beth symbol
      .replace(/\\gimel/g, 'ℷ') // Fix gimel symbol
      .replace(/\\daleth/g, 'ℸ') // Fix daleth symbol
      .replace(/\\text\{([^}]+)\}/g, '$1') // Remove \text{} wrapper
      .replace(/\\bigl\(/g, '(') // Fix big left parenthesis
      .replace(/\\bigr\)/g, ')') // Fix big right parenthesis
      .replace(/\\Bigl\(/g, '(') // Fix Big left parenthesis
      .replace(/\\Bigr\)/g, ')') // Fix Big right parenthesis
      .replace(/\\biggl\(/g, '(') // Fix bigg left parenthesis
      .replace(/\\biggr\)/g, ')') // Fix bigg right parenthesis
      .replace(/\\Biggl\(/g, '(') // Fix Bigg left parenthesis
      .replace(/\\Biggr\)/g, ')') // Fix Bigg right parenthesis
      .replace(/\\quad/g, ' ') // Fix quad spacing
      .replace(/\\,/g, ' ') // Fix small space
      .replace(/\\;/g, ' ') // Fix medium space
      .replace(/\\!/g, '') // Fix negative space
      .replace(/\\:/g, ' ') // Fix medium space
      .replace(/\\ /g, ' ') // Fix space
      .replace(/\\quad/g, ' ') // Fix quad
      .replace(/\\qquad/g, ' ') // Fix qquad
      .replace(/\n\n/g, '\n') // Fix double newlines
      .replace(/\\begin\{([^}]+)\}([\s\S]*?)\\end\{([^}]+)\}/g, '$2') // Remove LaTeX environments
      .replace(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g, '$1') // Remove align* environments
      .replace(/\\begin\{align\}([\s\S]*?)\\end\{align\}/g, '$1') // Remove align environments
      .replace(/\\begin\{equation\*\}([\s\S]*?)\\end\{equation\*\}/g, '$1') // Remove equation* environments
      .replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, '$1') // Remove equation environments
      .replace(/\\begin\{eqnarray\*\}([\s\S]*?)\\end\{eqnarray\*\}/g, '$1') // Remove eqnarray* environments
      .replace(/\\begin\{eqnarray\}([\s\S]*?)\\end\{eqnarray\}/g, '$1') // Remove eqnarray environments
      .replace(/\\begin\{gather\*\}([\s\S]*?)\\end\{gather\*\}/g, '$1') // Remove gather* environments
      .replace(/\\begin\{gather\}([\s\S]*?)\\end\{gather\}/g, '$1') // Remove gather environments
      .replace(/\\begin\{multline\*\}([\s\S]*?)\\end\{multline\*\}/g, '$1') // Remove multline* environments
      .replace(/\\begin\{multline\}([\s\S]*?)\\end\{multline\}/g, '$1') // Remove multline environments
      .replace(/\\begin\{split\}([\s\S]*?)\\end\{split\}/g, '$1') // Remove split environments
      .replace(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g, '$1') // Remove aligned environments
      .replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, '$1') // Remove cases environments
      .replace(/\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}/g, '$1') // Remove matrix environments
      .replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g, '$1') // Remove pmatrix environments
      .replace(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g, '$1') // Remove bmatrix environments
      .replace(/\\begin\{vmatrix\}([\s\S]*?)\\end\{vmatrix\}/g, '$1') // Remove vmatrix environments
      .replace(/\\begin\{Vmatrix\}([\s\S]*?)\\end\{Vmatrix\}/g, '$1') // Remove Vmatrix environments
      .replace(/\\begin\{array\}([\s\S]*?)\\end\{array\}/g, '$1') // Remove array environments
      .replace(/\\begin\{tabular\}([\s\S]*?)\\end\{tabular\}/g, '$1') // Remove tabular environments
      .replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, '$1') // Remove itemize environments
      .replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, '$1') // Remove enumerate environments
      .replace(/\\begin\{description\}([\s\S]*?)\\end\{description\}/g, '$1') // Remove description environments
      .replace(/\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g, '$1') // Remove quote environments
      .replace(/\\begin\{quotation\}([\s\S]*?)\\end\{quotation\}/g, '$1') // Remove quotation environments
      .replace(/\\begin\{verse\}([\s\S]*?)\\end\{verse\}/g, '$1') // Remove verse environments
      .replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, '$1') // Remove center environments
      .replace(/\\begin\{flushleft\}([\s\S]*?)\\end\{flushleft\}/g, '$1') // Remove flushleft environments
      .replace(/\\begin\{flushright\}([\s\S]*?)\\end\{flushright\}/g, '$1') // Remove flushright environments
      .replace(/\\begin\{figure\}([\s\S]*?)\\end\{figure\}/g, '$1') // Remove figure environments
      .replace(/\\begin\{table\}([\s\S]*?)\\end\{table\}/g, '$1') // Remove table environments
      .replace(/\\begin\{minipage\}([\s\S]*?)\\end\{minipage\}/g, '$1') // Remove minipage environments
      .replace(/\\begin\{frame\}([\s\S]*?)\\end\{frame\}/g, '$1') // Remove frame environments
      .replace(/\\begin\{block\}([\s\S]*?)\\end\{block\}/g, '$1') // Remove block environments
      .replace(/\\begin\{alertblock\}([\s\S]*?)\\end\{alertblock\}/g, '$1') // Remove alertblock environments
      .replace(/\\begin\{exampleblock\}([\s\S]*?)\\end\{exampleblock\}/g, '$1') // Remove exampleblock environments
      .replace(/\\begin\{theorem\}([\s\S]*?)\\end\{theorem\}/g, '$1') // Remove theorem environments
      .replace(/\\begin\{lemma\}([\s\S]*?)\\end\{lemma\}/g, '$1') // Remove lemma environments
      .replace(/\\begin\{corollary\}([\s\S]*?)\\end\{corollary\}/g, '$1') // Remove corollary environments
      .replace(/\\begin\{proposition\}([\s\S]*?)\\end\{proposition\}/g, '$1') // Remove proposition environments
      .replace(/\\begin\{definition\}([\s\S]*?)\\end\{definition\}/g, '$1') // Remove definition environments
      .replace(/\\begin\{example\}([\s\S]*?)\\end\{example\}/g, '$1') // Remove example environments
      .replace(/\\begin\{proof\}([\s\S]*?)\\end\{proof\}/g, '$1') // Remove proof environments
      .replace(/\\begin\{remark\}([\s\S]*?)\\end\{remark\}/g, '$1') // Remove remark environments
      .replace(/\\begin\{note\}([\s\S]*?)\\end\{note\}/g, '$1') // Remove note environments
      .replace(/\\begin\{question\}([\s\S]*?)\\end\{question\}/g, '$1') // Remove question environments
      .replace(/\\begin\{exercise\}([\s\S]*?)\\end\{exercise\}/g, '$1') // Remove exercise environments
      .replace(/\\begin\{problem\}([\s\S]*?)\\end\{problem\}/g, '$1') // Remove problem environments
      .replace(/\\begin\{solution\}([\s\S]*?)\\end\{solution\}/g, '$1') // Remove solution environments
      .replace(/\\begin\{answer\}([\s\S]*?)\\end\{answer\}/g, '$1') // Remove answer environments
      .replace(/\\begin\{hint\}([\s\S]*?)\\end\{hint\}/g, '$1') // Remove hint environments
      .replace(/\\begin\{explanation\}([\s\S]*?)\\end\{explanation\}/g, '$1') // Remove explanation environments
      .replace(/\\begin\{discussion\}([\s\S]*?)\\end\{discussion\}/g, '$1') // Remove discussion environments
      .replace(/\\begin\{conclusion\}([\s\S]*?)\\end\{conclusion\}/g, '$1') // Remove conclusion environments
      .replace(/\\begin\{acknowledgement\}([\s\S]*?)\\end\{acknowledgement\}/g, '$1') // Remove acknowledgement environments
      .replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, '$1') // Remove abstract environments
      .replace(/\\begin\{keywords\}([\s\S]*?)\\end\{keywords\}/g, '$1') // Remove keywords environments
      .replace(/\\begin\{classification\}([\s\S]*?)\\end\{classification\}/g, '$1') // Remove classification environments
      .replace(/\\begin\{references\}([\s\S]*?)\\end\{references\}/g, '$1') // Remove references environments
      .replace(/\\begin\{bibliography\}([\s\S]*?)\\end\{bibliography\}/g, '$1') // Remove bibliography environments
      .replace(/\\begin\{thebibliography\}([\s\S]*?)\\end\{thebibliography\}/g, '$1') // Remove thebibliography environments
      .replace(/\\begin\{appendix\}([\s\S]*?)\\end\{appendix\}/g, '$1') // Remove appendix environments
      .replace(/\\begin\{index\}([\s\S]*?)\\end\{index\}/g, '$1') // Remove index environments
      .replace(/\\begin\{glossary\}([\s\S]*?)\\end\{glossary\}/g, '$1') // Remove glossary environments
      .replace(/\\begin\{notation\}([\s\S]*?)\\end\{notation\}/g, '$1') // Remove notation environments
      .replace(/\\begin\{symbols\}([\s\S]*?)\\end\{symbols\}/g, '$1') // Remove symbols environments
      .replace(/\\begin\{abbreviations\}([\s\S]*?)\\end\{abbreviations\}/g, '$1') // Remove abbreviations environments
      .replace(/\\begin\{acronyms\}([\s\S]*?)\\end\{acronyms\}/g, '$1') // Remove acronyms environments
      .replace(/\\begin\{nomenclature\}([\s\S]*?)\\end\{nomenclature\}/g, '$1') // Remove nomenclature environments
      .replace(/\\begin\{terms\}([\s\S]*?)\\end\{terms\}/g, '$1') // Remove terms environments
      .replace(/\\begin\{definitions\}([\s\S]*?)\\end\{definitions\}/g, '$1') // Remove definitions environments
      .replace(/\\begin\{examples\}([\s\S]*?)\\end\{examples\}/g, '$1') // Remove examples environments
      .replace(/\\begin\{exercises\}([\s\S]*?)\\end\{exercises\}/g, '$1') // Remove exercises environments
      .replace(/\\begin\{problems\}([\s\S]*?)\\end\{problems\}/g, '$1') // Remove problems environments
      .replace(/\\begin\{solutions\}([\s\S]*?)\\end\{solutions\}/g, '$1') // Remove solutions environments
      .replace(/\\begin\{answers\}([\s\S]*?)\\end\{answers\}/g, '$1') // Remove answers environments
      .replace(/\\begin\{hints\}([\s\S]*?)\\end\{hints\}/g, '$1') // Remove hints environments
      .replace(/\\begin\{explanations\}([\s\S]*?)\\end\{explanations\}/g, '$1') // Remove explanations environments
      .replace(/\\begin\{discussions\}([\s\S]*?)\\end\{discussions\}/g, '$1') // Remove discussions environments
      .replace(/\\begin\{conclusions\}([\s\S]*?)\\end\{conclusions\}/g, '$1') // Remove conclusions environments
      .replace(/\\begin\{acknowledgements\}([\s\S]*?)\\end\{acknowledgements\}/g, '$1') // Remove acknowledgements environments
      .replace(/\\begin\{appendices\}([\s\S]*?)\\end\{appendices\}/g, '$1') // Remove appendices environments
      .replace(/\\begin\{indexes\}([\s\S]*?)\\end\{indexes\}/g, '$1') // Remove indexes environments
      .replace(/\\begin\{glossaries\}([\s\S]*?)\\end\{glossaries\}/g, '$1') // Remove glossaries environments
      .replace(/\\begin\{notations\}([\s\S]*?)\\end\{notations\}/g, '$1') // Remove notations environments
      .replace(/\\begin\{symbolss\}([\s\S]*?)\\end\{symbolss\}/g, '$1') // Remove symbolss environments
      .replace(/\\begin\{abbreviationss\}([\s\S]*?)\\end\{abbreviationss\}/g, '$1') // Remove abbreviationss environments
      .replace(/\\begin\{acronymss\}([\s\S]*?)\\end\{acronymss\}/g, '$1') // Remove acronymss environments
      .replace(/\\begin\{nomenclaturess\}([\s\S]*?)\\end\{nomenclaturess\}/g, '$1') // Remove nomenclaturess environments
      .replace(/\\begin\{termss\}([\s\S]*?)\\end\{termss\}/g, '$1') // Remove termss environments
      .replace(/\\begin\{definitionss\}([\s\S]*?)\\end\{definitionss\}/g, '$1') // Remove definitionss environments
      .replace(/\\begin\{exampless\}([\s\S]*?)\\end\{exampless\}/g, '$1') // Remove exampless environments
      .replace(/\\begin\{exercisess\}([\s\S]*?)\\end\{exercisess\}/g, '$1') // Remove exercisess environments
      .replace(/\\begin\{problemss\}([\s\S]*?)\\end\{problemss\}/g, '$1') // Remove problemss environments
      .replace(/\\begin\{solutionss\}([\s\S]*?)\\end\{solutionss\}/g, '$1') // Remove solutionss environments
      .replace(/\\begin\{answerss\}([\s\S]*?)\\end\{answerss\}/g, '$1') // Remove answerss environments
      .replace(/\\begin\{hintss\}([\s\S]*?)\\end\{hintss\}/g, '$1') // Remove hintss environments
      .replace(/\\begin\{explanationss\}([\s\S]*?)\\end\{explanationss\}/g, '$1') // Remove explanationss environments
      .replace(/\\begin\{discussionss\}([\s\S]*?)\\end\{discussionss\}/g, '$1') // Remove discussionss environments
      .replace(/\\begin\{conclusionss\}([\s\S]*?)\\end\{conclusionss\}/g, '$1') // Remove conclusionss environments
      .replace(/\\begin\{acknowledgementss\}([\s\S]*?)\\end\{acknowledgementss\}/g, '$1') // Remove acknowledgementss environments
      .replace(/\\item/g, '-'); // Replace \item with bullet points

    // Render markdown with math support
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]} 
          rehypePlugins={[rehypeKatex]}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-white'
            }`}
          >
            <div className="flex items-start gap-2">
              {msg.role === 'assistant' ? (
                <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium text-xs mb-1">
                  {msg.role === 'user' ? 'Você' : selectedAgent}
                </p>
                {msg.role === 'assistant' ? (
                  processMessageContent(msg.content)
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {isGenerating && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg p-4 bg-gray-700 text-white">
            <div className="flex items-start gap-2">
              <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-xs mb-1">{selectedAgent}</p>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {generatedResponse}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;