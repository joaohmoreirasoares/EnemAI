<section className='text-white w-full bg-slate-950'>
          <div className='flex justify-between px-16 w-full min-w-screen'> // <-- EDIT HERE
            <div className='grid gap-2'>
              {articleCardsData.map((card, i) => (
                <figure key={i} className='sticky top-0 h-screen grid place-content-center'>