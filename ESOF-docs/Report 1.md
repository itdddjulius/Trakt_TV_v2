# ESOF - Report nr 1

## DuckieTV

### Project Description

Duckie Tv is a program for TV and movie enthusiasts with the goal of helping you track down your favorite series and films alongside a customized calendar. By now it has been extended to also help you find safe and updated torrent links for you to download and watch your episodes. All of this is available on the great majority of platforms.

The project was originally created by “SchizoDuckie” as an AngularJS learning project, but scaled into a collaboration project with over 300.000 code lines committed by 4 main collaborators and reviewed mostly by themselves, too. In spite of having reached a much bigger size than originally planned for, the developers still maintain the original working philosophy: 

> "In the end DuckieTV is a project that was built for fun by people in their free time so working on it should be as fun as possible."


### Software Development Process

DuckieTV does not have any specifically defined Software Development Process, as the author explains,

> "Things aren’t prototyped, mostly not even sketched out but are just ideas or concepts that grow in our minds."

This, however, doesn’t mean some development guidelines aren’t followed. In fact, DuckieTV’s development follows *Agile* pretty strictly, never enforcing any particular stage to be ready before continuing with the next one, as you would see in a *Waterfall* process. Being, at least partially, a community-created product, there are “often many things are being worked at at the same time” which results in a *release early, release often* methodology. 

However, as an *incremental development and delivery project* without a clearly defined structure, some problems tend to arrive, as [Schizo](https://github.com/SchizoDuckie) explains,

> “[Sometimes] we have to hide some in-progress stuff to get a release out”.

This waste of time doesn’t seem to concern the team too much, because it saves them the hassle of worrying whether they are following the guidelines, allowing them a larger maneuvering space and more freedom. In fact, the team admits to prefer re-factoring incomplete ideas when it’s obvious they’ll become core features of DuckieTV over pre-emptively planning them.

> "It's okay if the initial implementation of something is a somewhat hacky job, as long as things … get refactored into something reusable when they touch multiple parts of the app.”

Some ideas, however, are too big to be handled without a structure. Because of this, as the project grew bigger, the team created a ticket system to document their ideas and help debate the minutae regarding the next implementations. 

In order to improve communication between the team, and also because it is mostly a learning project, Schizo started to develop graphs and diagrams to share with the team, explaining how the functionality is structured, as can be seen on most of the files he overwatches, like [*EVENTS.md*](https://github.com/SchizoDuckie/DuckieTV/blob/angular/EVENTS.md).

### Critical Analysis

#### Code

After going through innumerous code  files, it is easy to realize that these are well structured and full of comments that help create a better understanding of what is their purpose and why it was done like that.

In general, the API is well documented and its code files are organized in packages with specific functions, which also helps in a better understanding of a project with this size.
There are also multiple markdown files containing additional information and documentation regarding implemented features, explaining what they do for those who don’t want to look at the code, but just get the general idea. This is brilliant because it allows better abstraction for new features that need to be linked to old ones, but don’t require in-depth knowledge to be developed. Sadly, this documentation doesn’t exist for every feature yet.

#### Commits

Since this project is personal and done in the spare time the number of commits per day, per week changes in time. That explains the spikes seen on the graphic below.

![Commits Frequency](http://i.imgur.com/3MAT5Jv.png)
        
The message of the commit is self-explanatory of what the commit fixes and/or adds to the project.

At the time of this report the team is still adding new features as well as fixing issues.


#### Repository
Being an open source project with multiple contributions by many collaborators, it is hard to control all the pull requests coming in without a global understanding of the project. All collaborators can share their opinion on a pull request but it is the creator and “garfield69” that have the final say on a pull-request being accepted or declined. 

This method isn’t very practical because all the work of analysing and testing the new features falls on two people, who are also main contributors, which overloads them. Because of this overload, we think it is important to add a reviewer to the group to make it easier and quicker to either accept or decline the pull request.


#### Milestones
The project doesn’t have very specific milestones and they never have a set deadline. Issues in the product are identified, catalogued and set up for future work upon, but there is never a specific milestone that needs to be met for a release. 

Once a feature is ready to be deployed it is released. This makes sense if we consider how many things are being worked at at the same time. If they were too focused on a particular milestone, other areas would need to be left for later, and the so highly valued freedom that the team has would be diminished.


### Conclusions
Summing up, DuckieTV as a open-source project built for fun does not have a strict software development method.

The developers of the project had no idea what kind of development methods existed mainly because they wanted to keep it simple and with “as little as possible ‘Project Management’”. Although after our introduction to this subject they think the project is very much like Agile (Incremental development and Delivery).

DuckieTV has a lot of commits, several working branches each one with its own feature associated and four main contributors, two of them are the reviewers of the pull requests. Everything is done in the spare time and that explains the spikes in the commits graphic.


### Authors
* João Silva (up201305892@fe.up.pt)
* Luís Figueiredo (up20130 @fe.up.pt)
* Pedro Teles (up201305101@fe.up.pt)

**Faculdade de Engenharia da Universidade do Porto - MIEIC                 2015-10-04**
