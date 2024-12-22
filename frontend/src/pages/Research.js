import React from 'react';

const Research = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 md:px-6 bg-white">
      
      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Streamer's Guide to Constructive Feedback</h1>
        <p className="text-lg text-gray-700">
          At Streamfeed, we understand the challenges of getting valuable feedback. We’re here to help you get the most constructive insights to improve your streams!
        </p>
      </section>

      
      {/* Background Information Section */}
      <section className="w-full max-w-4xl mb-12">
        <h2 className="text-3xl font-semibold mb-6">Why We're Here</h2>
        <p className="text-gray-700 mb-4">
          We found that most streamers struggle with asking good feedback questions. They often focus on technical aspects like "How's my mic?" or "How's my audio?" and, if not technical, they usually ask broad questions like "Did you enjoy the stream?" or "How was it?"
        </p>
        <p className="text-gray-700 mb-4">
          On the other hand, viewers often don’t know how to provide useful feedback. They might respond with generic comments like "Great stream!" or "Enjoyed the stream," which can be vague and not actionable.
        </p>
        <p className="text-gray-700 mb-4">
          This is where we come in! Our goal is to provide you, the streamer, with constructive feedback that can help you reach your goals, whether it’s increasing engagement, improving content, or growing your community.
        </p>

        <p className="text-gray-700 mb-4">
          The source code for this project is available here: https://github.com/kerixyz/streamfeed.xyz
        </p>
      </section>

      {/* Learn More Section */}
      <section className="w-full max-w-4xl mb-12">
        <h2 className="text-3xl font-semibold mb-6">Related Papers</h2>
        <p className="text-gray-700 mb-4">
          Here’s some of the prior work that informed our approach. We’ve combined insights from various studies to help you get better feedback, faster.
        </p>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold"> Understanding analytics needs of video game streamers </h3>
          <p className="text-gray-700 mb-2">
            This study explored how streamers can better understand the types of feedback viewers provide and how to make it more useful.
          </p>
          <a
            href="https://dl.acm.org/doi/pdf/10.1145/3411764.3445320?casa_token=WU47fzd2vs8AAAAA:MRnzuNLahYG9MiN09BUDmT9V9uabU_Zjhyw3Akb9wF_tY9JTLDcAFne76Cyg84baqz-IxFzqlWZV0A"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Read more
          </a>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Audience management practices of live streamers on Twitch </h3>
          <p className="text-gray-700 mb-2">
            This study investigates how Twitch streamers navigate audience management, leveraging real-time signals and human labor to scale their media presence, and offers design recommendations for streamer-centric tools to support audience discovery and growth.
          </p>
          <a
            href="https://dl.acm.org/doi/pdf/10.1145/3391614.3393653"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Read more
          </a>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Designing interactive scaffolds to encourage reflection on peer feedback</h3>
          <p className="text-gray-700 mb-2">
            This work explores challenges in student feedback reflection and proposes design strategies, including scaffolds for self-reflection and goal alignment, to promote deeper engagement in project-based learning.
          </p>
          <a
            href="https://dl.acm.org/doi/pdf/10.1145/3357236.3395480?casa_token=oRpCwpO_XiYAAAAA:P-N_cOSVGV_o1_9wrTU2uO_dkqeBWWtZe119eejyI5H4QuNE0ysGl-ax_X1nWCbwb9CojcGLAOBvhg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Read more
          </a>
        </div>
      </section>
      <footer className="py-6 px-6 bg-white text-gray-600">
        <p>This is an ongoing research project at the University of Washington. By clicking any of the links above, you acknowledge that your feedback may be used for ongoing research to improve the StreamFeed platform. We collect and analyze feedback to better understand how streamers engage with their audiences. Your participation is voluntary, and all data will be anonymized to ensure your privacy.</p>
        <br/>
        <p>For questions, comments, or feedback, please contact: kmallari[at]uw[dot]edu</p>
      </footer>
    </div>
  );
};

export default Research;
