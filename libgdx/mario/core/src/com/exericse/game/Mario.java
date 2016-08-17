package com.exericse.game;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.audio.Sound;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.g2d.Batch;
import com.badlogic.gdx.graphics.g2d.ParticleEffect;
import com.badlogic.gdx.graphics.g2d.ParticleEmitter;
import com.badlogic.gdx.utils.Array;
import com.badlogic.gdx.utils.Timer;
import com.badlogic.gdx.utils.viewport.FitViewport;
import com.badlogic.gdx.utils.viewport.Viewport;
import com.libgdx.html5.gameframework.DebugMessage;
import com.libgdx.html5.gameframework.GameStage;
import com.libgdx.html5.gameframework.Utility;

import java.util.LinkedList;
import java.util.List;

public class Mario extends ApplicationAdapter {
	private Viewport viewport;

	private final FruitPattern[] cell_ratio = {
			new FruitPattern(8, 10), new FruitPattern(6, 15), new FruitPattern(5, 50), new FruitPattern(5, 100) ,
			new FruitPattern(1, 4), new FruitPattern(9, 2), new FruitPattern(7, 10), new FruitPattern(2, 20),
			new FruitPattern(9, 2), new FruitPattern(-1, -1), new FruitPattern(1, 4), new FruitPattern(9, 2),
			new FruitPattern(8, 10) ,new FruitPattern(6, 15), new FruitPattern(9, 2), new FruitPattern(4, 40),
			new FruitPattern(1, 4), new FruitPattern(9, 2), new FruitPattern(7, 10), new FruitPattern(3, 30),
			new FruitPattern(9, 2), new FruitPattern(-1, -1), new FruitPattern(1, 4), new FruitPattern(9, 2)};

//	4, 20, 30, 40, 100, 15, 10, 10, 2};
	private final BetButtonInfo[] cell_bet_ratio = {new BetButtonInfo(1, "Btn_Fruit09", 4),
													new BetButtonInfo(2, "Btn_Fruit08", 20),
													new BetButtonInfo(3, "Btn_Fruit07", 30),
													new BetButtonInfo(4, "Btn_Fruit06", 40),
													new BetButtonInfo(5, "Btn_Fruit05", 100),
													new BetButtonInfo(6, "Btn_Fruit04", 15),
													new BetButtonInfo(7, "Btn_Fruit03", 10),
													new BetButtonInfo(8, "Btn_Fruit02", 10),
													new BetButtonInfo(9, "Btn_Fruit01", 2)
											};

	private static Mario _instance = null;
	public static Mario getInstance(){return _instance;}

	private List<LightCell> _cells_light = new LinkedList<LightCell>();
	private List<BetCell> _cells_bet = new LinkedList<BetCell>();
	private BtnGroup _btn_group = null;
	private BetBigSmall _betBigSmall = null;
	private MoneyGroup _money_group = null;
	private ListView _listView_msg = null;

	private GameStage stage;        //** window is stage **//
	private Timer _timer_flick_marquee;
	private Timer _timer_update_marquee;
	private StepController _stepController = null;
	private Array<ParticleEmitter> emitters = null;
	private ParticleEffect effect_bg = null;
	private ParticleEffect effect_start = null;

	private Sound sound = null;

	private Sound sound_bgm = null;

	public boolean Is_RunningMarquee(){
		return (_stepController.get_light_remain_steps()>0) || (_betBigSmall.get_remain_steps()>0);
	}

	@Override
	public void create () {

		viewport = new FitViewport(500, 550); // this should be the size of camera in WORLD units. make sure you check that in editor first.

		stage = new GameStage("MainScene", viewport);
		Gdx.input.setInputProcessor(stage); //** stage is responsive **//

		initPanelCell();
		initBetCell();
		initBtnGroup();
		initBetBigSmall();
		initMoneyGroup();

		_stepController = new StepController(_cells_light.size());

		_timer_update_marquee = new Timer();
		_timer_flick_marquee = new Timer();
		_instance = this;

		_listView_msg = new ListView(stage, 100, 250);
		_listView_msg.setPosition(395, 295);

		effect_bg = new ParticleEffect();
		effect_bg.load(Gdx.files.internal("particle/explosion.p"), Gdx.files.internal("particle"));

		emitters = new Array(effect_bg.getEmitters());
		emitters.get(0).setPosition(Gdx.graphics.getWidth() / 2, Gdx.graphics.getHeight() / 2);

		effect_bg.getEmitters().clear();
		effect_bg.getEmitters().add(emitters.get(0));

		effect_start = new ParticleEffect();
		effect_start.load(Gdx.files.internal("particle/explosion.p"), Gdx.files.internal("particle"));
		effect_start.getEmitters().clear();
		emitters.get(1).setPosition(50, 500);
		effect_start.getEmitters().add(emitters.get(1));

		sound = Gdx.audio.newSound(Gdx.files.internal("sound/ding.ogg"));
		sound_bgm= Gdx.audio.newSound(Gdx.files.internal("sound/BGM.ogg"));

		long id = sound_bgm.play(1.0f);
		sound_bgm.setVolume(id, 0.2f);
		sound_bgm.setLooping(id, true);
	}

	private void resetSchedule(float interval){
		_timer_update_marquee.clear();
		_timer_update_marquee.scheduleTask(
				new Timer.Task(){
					@Override
					public void run() {
						onUpdateRunMarquee();
					}
				},
				0, interval);
	}

	private void initPanelCell(){

		for(int i=0; i<cell_ratio.length; i++) {
			GameStage.CompositeImage compositeImage = stage.getItem(Utility.formatString("light_%d", i+1));
			_cells_light.add(new LightCell(stage, new Point(compositeImage.get_x(), compositeImage.get_y()), cell_ratio[i]));
		}
	}

	private void initBetCell(){
		for(int i=1; i<=cell_bet_ratio.length; i++) {

			GameStage.CompositeImage compositeImage_btn = stage.getItem(Utility.formatString("btn_fruit_%d", i));
			GameStage.CompositeImage compositeImage_bet = stage.getItem(Utility.formatString("bet_fruit_%d", i));

			compositeImage_btn.removeActor();
			compositeImage_bet.removeActor();

			_cells_bet.add(new BetCell(stage, cell_bet_ratio[i-1], cell_bet_ratio[i-1].ImgSerialName,
										new Point(compositeImage_btn.get_x(), compositeImage_btn.get_y()),
										new Point(compositeImage_bet.get_x(), compositeImage_bet.get_y())));
		}
	}

	private int get_bet_count(){
		int result = 0;
		for(int i=0; i<_cells_bet.size(); i++)
			result+=_cells_bet.get(i).get_bet_count();

		return result;
	}

	private void onBetStart(int bet_count){
		if(Is_RunningMarquee())
			return;

		_timer_flick_marquee.clear();
		_stepController.startBet();
		resetSchedule(0.1f);

		_money_group.set_money(_money_group.get_money()-bet_count);

		_listView_msg.add(Utility.formatString("speed $%d", bet_count));
		effect_start.reset();
	}

	private void onBetOver(){
		int hit_light_cell = _stepController.get_current_light_index();
		FruitPattern hit_pattern = cell_ratio[hit_light_cell];

		int bonus = 0;

		for(int i=0; i<_cells_bet.size(); i++)
		if(_cells_bet.get(i).get_pattern_id()==hit_pattern.get_id())
			bonus+= _cells_bet.get(i).get_ratio() * _cells_bet.get(i).get_bet_count();

		if(bonus>0) {
			_money_group.set_bonus(_money_group.get_bonus() + bonus);
			_listView_msg.add(Utility.formatString("win $%d", bonus));
		}

		if(hit_pattern.get_id()==-1)
			onBetStart(0);
	}

	private void initBtnGroup(){
		GameStage.CompositeImage compositeImage_btn_bet_group = stage.getItem("btn_bet_group");
		GameStage.CompositeImage compositeImage_btn_quit = stage.getItem("btn_quit");

		compositeImage_btn_bet_group.removeActor();
		compositeImage_btn_quit.removeActor();

		_btn_group = new BtnGroup(stage, compositeImage_btn_bet_group.get_position(), compositeImage_btn_quit.get_position(),
					new Runnable() {
						@Override
						public void run() {
							onBetStart(get_bet_count());
						}
					},

					new Runnable() {
						@Override
						public void run() {
							int bonus = _money_group.get_bonus();

							if(bonus>0) {
								_money_group.set_bonus(0);
								_money_group.set_score(bonus);
							}
						}
					},

					new Runnable() {
						@Override
						public void run() {
							for(int i=0; i<_cells_bet.size(); i++)
								_cells_bet.get(i).clearBet();
						}
					},

					new Runnable() {
						@Override
						public void run() {
							Gdx.app.exit();
						}
					}
				);
	}

	private void initBetBigSmall(){
		GameStage.CompositeImage compositeImage_btn_big = stage.getItem("btn_big");
		GameStage.CompositeImage compositeImage_btn_small = stage.getItem("btn_small");
		GameStage.CompositeImage compositeImage_light_big = stage.getItem("light_big");
		GameStage.CompositeImage compositeImage_light_small = stage.getItem("light_small");

		compositeImage_btn_big.removeActor();
		compositeImage_btn_small.removeActor();

		_betBigSmall = new BetBigSmall(stage, 	compositeImage_btn_big.get_position(), compositeImage_btn_small.get_position(),
												compositeImage_light_big.get_position(), compositeImage_light_small.get_position(),
				new Runnable() {
					@Override
					public void run() {
						if(Is_RunningMarquee())
							return;

						if(_money_group.get_bonus()<=0)
							return;

						_betBigSmall.startBet(1);
					}
				},
				new Runnable() {
					@Override
					public void run() {
						if(Is_RunningMarquee())
							return;
						if(_money_group.get_bonus()<=0)
							return;

						_betBigSmall.startBet(0);
					}
				},
				new Runnable() {
					@Override
					public void run() {
						int bet_amount = _money_group.get_bonus();

						_money_group.set_bonus(0);

						if(_betBigSmall.get_bet_light_id()==_betBigSmall.get_hit_light_id())
							_money_group.set_bonus(bet_amount*2);
					}
				});
	}

	private void initMoneyGroup(){
		GameStage.CompositeImage compositeImage_score = stage.getItem("lb_score");
		GameStage.CompositeImage compositeImage_money = stage.getItem("lb_money");
		GameStage.CompositeImage compositeImage_bonus = stage.getItem("lb_bonus");

		_money_group = new MoneyGroup(stage, compositeImage_score.get_position(),
												compositeImage_money.get_position(),
												compositeImage_bonus.get_position());

		_money_group.set_money(999999);
		_money_group.set_score(0);
		_money_group.set_bonus(0);
	}

	@Override
	public void render () {
		Gdx.gl.glClearColor(0, 0, 0, 1);
		Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

		stage.act();
		stage.draw();

		Batch batch = stage.getBatch();

		batch.begin();

		for (int i = 0; i < _cells_bet.size(); i++)
			_cells_bet.get(i).draw(batch);

		for (int i = 0; i < _cells_light.size(); i++)
			_cells_light.get(i).draw(batch);

		_money_group.draw(batch);

		_betBigSmall.draw(batch);

		effect_bg.draw(batch, Gdx.graphics.getDeltaTime());
		effect_start.draw(batch, Gdx.graphics.getDeltaTime());

		if (effect_bg.isComplete())
			effect_bg.reset();
		batch.end();
	}

	private void onUpdateRunMarquee(){
		_stepController.update();

		sound.play(1.0f);

		for(int i=0; i<_cells_light.size(); i++) {
			_cells_light.get(i).reset();

			if(i==_stepController.get_current_light_index())
				_cells_light.get(i).hit();

			if(_stepController.get_second_light_index()>=0)
			if(i==_stepController.get_second_light_index())
				_cells_light.get(i).hit();

			if(_stepController.get_third_light_index()>=0)
			if(i==_stepController.get_third_light_index())
				_cells_light.get(i).hit();
		}

		if(_stepController.get_light_remain_steps() == _stepController.get_light_slow_down_index())
			resetSchedule(1.0f);

		if(_stepController.get_light_remain_steps()<=0)
		{
			_timer_update_marquee.clear();

			for(int i=0; i<_cells_light.size(); i++) {
				_cells_light.get(i).reset();

				if(i==_stepController.get_current_light_index())
					_cells_light.get(i).hit();
			}

			_timer_flick_marquee.scheduleTask(new Timer.Task() {
				@Override
				public void run() {
					if(_cells_light.get(_stepController.get_current_light_index()).get_is_hit())
						_cells_light.get(_stepController.get_current_light_index()).reset();
					else
						_cells_light.get(_stepController.get_current_light_index()).hit();

				}
			}, 0, 0.1f);

			onBetOver();
		}
	}
}
